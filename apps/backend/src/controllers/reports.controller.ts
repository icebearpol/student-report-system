import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import type { Prisma, ReportStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { analyzeReport, aiRequired, type ModerationResult } from '../lib/aiModeration';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const RANK: Record<string, number> = { low: 0, medium: 1, high: 2, urgent: 3 };
const CATEGORIES = ['maintenance', 'safety', 'facilities', 'it_support', 'other'];
const STATUSES = ['pending', 'in_review', 'resolved'];
const SEVERITIES = ['info', 'warning', 'danger'];
const STATUS_TEXT: Record<string, string> = { pending: 'Pending', in_review: 'In Review', resolved: 'Resolved' };
const DAILY_URGENT_LIMIT = 2;
const STRIKE_LIMIT = 3;

const REPORT_WINDOW_MS = 10 * 60 * 1000;
const REPORT_LIMIT_USER = 5;
const REPORT_LIMIT_GUEST = 3;
const reportHits = new Map<string, number[]>();

const AI_CACHE_MS = 30 * 60 * 1000;
const aiCache = new Map<string, { result: ModerationResult; at: number }>();

const PUBLIC_AUTHOR = { select: { id: true, fullName: true, username: true } };
const ADMIN_AUTHOR = {
  select: {
    id: true,
    fullName: true,
    username: true,
    email: true,
    studentId: true,
    role: true,
    emailVerified: true,
    urgentStrikes: true,
    urgentBlocked: true,
  },
};

function isAdmin(req: Request) {
  return req.user?.role === 'ADMIN';
}

function authorInclude(req: Request): any {
  return { author: isAdmin(req) ? ADMIN_AUTHOR : PUBLIC_AUTHOR };
}

function visibleWhere(req: Request): Prisma.ReportWhereInput {
  if (isAdmin(req)) return {};
  const me = req.user?.sub;
  const either: Prisma.ReportWhereInput[] = [{ flagged: false }];
  if (me) either.push({ authorId: me });
  return { removedAt: null, OR: either };
}

function serialize(report: any, req: Request) {
  const admin = isAdmin(req);
  const owner = !!req.user && report.authorId === req.user.sub;
  const out = { ...report };

  if (!admin) {
    delete out.aiStatus;
    delete out.aiSummary;
    delete out.aiSuggestedPriority;
    delete out.flagged;
    delete out.flagReason;
    delete out.priorityReview;
    delete out.reportedPriority;
    delete out.urgentStrikeApplied;
    delete out.removedAt;
    delete out.removedReason;
    if (report.anonymous && !owner) {
      out.authorId = null;
      out.author = null;
    }
  }
  return out;
}

async function loadReport(req: Request, id: string) {
  const report = await prisma.report.findFirst({
    where: { id, ...visibleWhere(req) },
    include: authorInclude(req),
  });
  if (!report) return null;
  const out: any = serialize(report, req);
  if (isAdmin(req)) {
    out.alert = await prisma.notification.findFirst({
      where: { reportId: id, userId: null, type: 'announcement' },
      orderBy: { createdAt: 'desc' },
    });
  }
  return out;
}

function validCoordinate(value: unknown) {
  return typeof value === 'number' && value >= 0 && value <= 1 ? value : undefined;
}

function removeUpload(imageUrl?: string | null) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
  const file = path.join(process.cwd(), 'uploads', path.basename(imageUrl));
  fs.promises.unlink(file).catch(() => {});
}

function recentReports(key: string) {
  const now = Date.now();
  const recent = (reportHits.get(key) || []).filter((t) => now - t < REPORT_WINDOW_MS);
  reportHits.set(key, recent);
  return recent;
}

function reportRateLimited(key: string, limit: number) {
  return recentReports(key).length >= limit;
}

function recordReport(key: string) {
  recentReports(key).push(Date.now());
}

async function moderate(input: {
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string | null;
}): Promise<ModerationResult> {
  const key = `${input.imageUrl || ''}|${input.title}|${input.description}|${input.category}|${input.location}`;
  const hit = aiCache.get(key);
  if (hit && Date.now() - hit.at < AI_CACHE_MS) return hit.result;

  const result = await analyzeReport(input);
  console.log(
    `[ai] status=${result.status} suggested=${result.suggestedPriority ?? '-'} reason=${result.flagReason ?? '-'} | ${result.summary}`
  );

  if (result.status !== 'unchecked') {
    if (aiCache.size > 200) aiCache.delete(aiCache.keys().next().value as string);
    aiCache.set(key, { result, at: Date.now() });
  }
  return result;
}

export async function getAllReports(req: Request, res: Response) {
  const where: Prisma.ReportWhereInput = isAdmin(req)
    ? req.query.includeRemoved === '1'
      ? {}
      : { removedAt: null }
    : visibleWhere(req);

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: authorInclude(req),
  });
  res.status(200).json(reports.map((r: any) => serialize(r, req)));
}

export async function getReportById(req: Request, res: Response) {
  const out = await loadReport(req, req.params.id);
  if (!out) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.status(200).json(out);
}

export async function createReport(req: Request, res: Response) {
  const { title, description, location, category, priority, anonymous, imageUrl, mapX, mapY, confirmFlagged } = req.body;

  const author = req.user ? await prisma.user.findUnique({ where: { id: req.user.sub } }) : null;
  const requested = PRIORITIES.includes(priority) ? (priority as string) : 'medium';
  const cleanCategory = CATEGORIES.includes(category) ? (category as string) : 'other';

  const limitKey = author ? `u:${author.id}` : `ip:${req.ip}`;
  if (reportRateLimited(limitKey, author ? REPORT_LIMIT_USER : REPORT_LIMIT_GUEST)) {
    return res.status(429).json({ error: 'You are submitting reports too quickly. Please wait a few minutes and try again.' });
  }

  if (requested === 'urgent') {
    if (!author) {
      return res.status(403).json({ error: 'Urgent reports need a signed-in school account. Please choose High priority or sign in.' });
    }
    if (!author.emailVerified && author.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Verify your school email before marking a report as Urgent.' });
    }
    if (author.urgentBlocked) {
      return res.status(403).json({ error: 'Urgent reporting is turned off for your account because earlier urgent reports were not confirmed. Please use High priority.' });
    }
    const recentUrgent = await prisma.report.count({
      where: {
        authorId: author.id,
        reportedPriority: 'urgent',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recentUrgent >= DAILY_URGENT_LIMIT) {
      return res.status(429).json({ error: 'You have reached the daily limit for urgent reports. Please use High priority.' });
    }
  }

  const ai = await moderate({
    title,
    description,
    category: cleanCategory,
    location: location || '',
    imageUrl,
  });

  if (ai.failed && aiRequired && requested !== 'high' && requested !== 'urgent') {
    return res.status(429).json({
      error: 'Our AI checker is busy right now, so your report could not be verified. Please wait a moment and press Submit again.',
    });
  }

  if (ai.status === 'blocked') {
    removeUpload(imageUrl);
    await prisma.auditLog.create({
      data: { userId: author?.id, action: 'ai_blocked_report', detail: ai.flagReason || ai.summary },
    });
    return res.status(422).json({
      error: 'This report could not be accepted because the photo or description looks inappropriate. Please submit a clear photo of the actual campus issue.',
    });
  }

  if (ai.status === 'needs_review' && confirmFlagged !== true) {
    return res.status(200).json({
      needsConfirmation: true,
      reason: ai.flagReason || 'This does not look like a genuine campus issue.',
      summary: ai.summary,
    });
  }

  const flagged = ai.status === 'needs_review' || (ai.status === 'unchecked' && !!ai.flagReason);

  let effective = requested;
  let priorityReview = false;
  let notice: string | null = null;

  if (requested === 'urgent') {
    const says = ai.suggestedPriority;
    const aiConfirms = ai.status === 'clean' && (says === 'urgent' || says === 'high');
    if (ai.status !== 'unchecked' && (says === 'low' || says === 'medium')) {
      effective = 'high';
      priorityReview = true;
      notice = 'Your report was submitted as High priority. An administrator will confirm whether it qualifies as Urgent.';
    } else if (!aiConfirms) {
      priorityReview = true;
      notice = 'An administrator will confirm the Urgent priority shortly.';
    }
  }

  if (flagged) {
    const extra = ai.failed
      ? 'The AI check was unavailable, so an administrator will verify this report before it is shown to other students.'
      : 'An administrator will review this report before it is shown to other students.';
    notice = notice ? `${notice} ${extra}` : extra;
  }

  const data: Prisma.ReportUncheckedCreateInput = {
    title,
    description,
    location,
    category: cleanCategory,
    priority: effective,
    reportedPriority: requested,
    priorityReview,
    anonymous: author ? !!anonymous : true,
    imageUrl: typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/') ? imageUrl : undefined,
    authorId: author?.id,
    mapX: validCoordinate(mapX),
    mapY: validCoordinate(mapY),
    aiStatus: ai.status,
    aiSummary: ai.summary || null,
    aiSuggestedPriority: ai.suggestedPriority,
    flagged,
    flagReason: ai.flagReason,
  };

  const created = await prisma.report.create({ data });
  recordReport(limitKey);
  res.status(201).json({ ...serialize(created, req), notice });
}

export async function upvoteReport(req: Request, res: Response) {
  const { id } = req.params;
  const report = await prisma.report.findFirst({ where: { id, ...visibleWhere(req) } });
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  if (req.user && report.authorId === req.user.sub) {
    return res.status(403).json({ error: "You can't upvote your own report." });
  }
  const updated = await prisma.report.update({ where: { id }, data: { upvotes: { increment: 1 } } });
  res.status(200).json({ id: updated.id, upvotes: updated.upvotes });
}

export async function deleteReport(req: Request, res: Response) {
  const { id } = req.params;
  const userId = req.user?.sub;

  if (!userId) {
    return res.status(401).json({ error: 'You must be signed in to delete a report.' });
  }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  if (report.authorId !== userId) {
    return res.status(403).json({ error: 'You can only delete your own reports.' });
  }

  await prisma.report.delete({ where: { id } });
  removeUpload(report.imageUrl);
  res.status(200).json({ success: true });
}

export async function updateReport(req: Request, res: Response) {
  const { id } = req.params;
  const { status, assignedTo, priority, dismissFlag } = req.body;

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const data: Prisma.ReportUncheckedUpdateInput = {};
  let strikeAuthorId: string | null = null;

  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    data.status = status as ReportStatus;
  }

  if (assignedTo !== undefined) {
    data.assignedTo = typeof assignedTo === 'string' && assignedTo.trim() ? assignedTo.trim() : null;
  }

  if (priority !== undefined) {
    if (!PRIORITIES.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority.' });
    }
    data.priority = priority;
    data.priorityReview = false;
    if (
      report.reportedPriority === 'urgent' &&
      RANK[priority] < RANK.urgent &&
      report.authorId &&
      !report.urgentStrikeApplied
    ) {
      data.urgentStrikeApplied = true;
      strikeAuthorId = report.authorId;
    }
  }

  if (dismissFlag === true) {
    data.flagged = false;
    data.flagReason = null;
  }

  await prisma.report.update({ where: { id }, data });

  if (strikeAuthorId) {
    const striked = await prisma.user.update({
      where: { id: strikeAuthorId },
      data: { urgentStrikes: { increment: 1 } },
    });
    if (striked.urgentStrikes >= STRIKE_LIMIT && !striked.urgentBlocked) {
      await prisma.user.update({ where: { id: striked.id }, data: { urgentBlocked: true } });
    }
    await prisma.auditLog.create({
      data: {
        userId: striked.id,
        action: 'urgent_downgraded',
        detail: `"${report.title}" was reported as urgent but set to ${priority}.`,
      },
    });
  }

  if (data.status && data.status !== report.status && report.authorId) {
    await prisma.notification.create({
      data: {
        userId: report.authorId,
        type: 'status',
        title: 'Report update',
        body: `Your report "${report.title}" is now ${STATUS_TEXT[status]}.`,
        severity: 'info',
        reportId: report.id,
      },
    });
  }

  res.status(200).json(await loadReport(req, id));
}

export async function removeReport(req: Request, res: Response) {
  const { id } = req.params;
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
  if (reason.length < 3 || reason.length > 200) {
    return res.status(400).json({ error: 'Please give a short reason (3 to 200 characters).' });
  }

  const report = await prisma.report.findUnique({
    where: { id },
    include: { author: { select: { email: true } } },
  });
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  if (report.removedAt) {
    return res.status(400).json({ error: 'This report is already removed.' });
  }

  await prisma.report.update({ where: { id }, data: { removedAt: new Date(), removedReason: reason } });
  await prisma.notification.deleteMany({ where: { reportId: id, userId: null, type: 'announcement' } });

  if (report.authorId) {
    await prisma.notification.create({
      data: {
        userId: report.authorId,
        type: 'status',
        title: 'Report removed',
        body: `Your report "${report.title}" was removed by an administrator. Reason: ${reason}`,
        severity: 'warning',
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: req.user!.sub,
      action: 'report_removed',
      detail: `"${report.title}" (${report.author?.email || 'guest'}) - ${reason}`,
    },
  });

  res.status(200).json(await loadReport(req, id));
}

export async function restoreReport(req: Request, res: Response) {
  const { id } = req.params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  await prisma.report.update({ where: { id }, data: { removedAt: null, removedReason: null } });
  await prisma.auditLog.create({
    data: { userId: req.user!.sub, action: 'report_restored', detail: `"${report.title}"` },
  });

  res.status(200).json(await loadReport(req, id));
}

async function loadReportForChat(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ error: 'You must be signed in to use messages.' });
    return null;
  }
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return null;
  }
  if (req.user?.role !== 'ADMIN' && report.authorId !== userId) {
    res.status(403).json({ error: 'Only the reporter and administrators can view this conversation.' });
    return null;
  }
  return report;
}

const EDIT_WINDOW_MS = 20 * 60 * 1000;

function shapeComment(c: any, userId: string, fromAdmin: boolean) {
  const mine = c.authorId === userId;
  const deleted = !!c.deletedAt;
  return {
    id: c.id,
    body: deleted ? '' : c.body,
    createdAt: c.createdAt,
    editedAt: c.editedAt ?? null,
    deleted,
    fromAdmin,
    mine,
    canEdit: mine && !deleted && Date.now() - new Date(c.createdAt).getTime() < EDIT_WINDOW_MS,
  };
}

export async function getComments(req: Request, res: Response) {
  const report = await loadReportForChat(req, res);
  if (!report) return;

  const comments = await prisma.reportComment.findMany({
    where: { reportId: report.id },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { role: true } } },
  });

  res.status(200).json(comments.map((c) => shapeComment(c, req.user!.sub, c.author?.role === 'ADMIN')));
}

export async function addComment(req: Request, res: Response) {
  const report = await loadReportForChat(req, res);
  if (!report) return;

  const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
  if (!body || body.length > 1000) {
    return res.status(400).json({ error: 'Messages must be between 1 and 1000 characters.' });
  }

  const created = await prisma.reportComment.create({
    data: { body, reportId: report.id, authorId: req.user!.sub },
  });

  if (req.user!.role === 'ADMIN' && report.authorId && report.authorId !== req.user!.sub) {
    await prisma.notification.create({
      data: {
        userId: report.authorId,
        type: 'reply',
        title: 'New message from admin',
        body: body.slice(0, 120),
        severity: 'info',
        reportId: report.id,
      },
    });
  }

  res.status(201).json(shapeComment(created, req.user!.sub, req.user!.role === 'ADMIN'));
}

export async function editComment(req: Request, res: Response) {
  const report = await loadReportForChat(req, res);
  if (!report) return;

  const comment = await prisma.reportComment.findFirst({
    where: { id: req.params.commentId, reportId: report.id },
  });
  if (!comment) {
    return res.status(404).json({ error: 'Message not found.' });
  }
  if (comment.authorId !== req.user!.sub) {
    return res.status(403).json({ error: 'You can only edit your own messages.' });
  }
  if (comment.deletedAt) {
    return res.status(400).json({ error: 'That message was unsent.' });
  }
  if (Date.now() - comment.createdAt.getTime() >= EDIT_WINDOW_MS) {
    return res.status(403).json({ error: 'Messages can only be edited within 20 minutes of sending.' });
  }

  const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
  if (!body || body.length > 1000) {
    return res.status(400).json({ error: 'Messages must be between 1 and 1000 characters.' });
  }

  const updated = await prisma.reportComment.update({
    where: { id: comment.id },
    data: { body, editedAt: new Date() },
  });

  res.status(200).json(shapeComment(updated, req.user!.sub, req.user!.role === 'ADMIN'));
}

export async function unsendComment(req: Request, res: Response) {
  const report = await loadReportForChat(req, res);
  if (!report) return;

  const comment = await prisma.reportComment.findFirst({
    where: { id: req.params.commentId, reportId: report.id },
  });
  if (!comment) {
    return res.status(404).json({ error: 'Message not found.' });
  }
  if (comment.authorId !== req.user!.sub) {
    return res.status(403).json({ error: 'You can only unsend your own messages.' });
  }

  if (!comment.deletedAt) {
    await prisma.reportComment.update({ where: { id: comment.id }, data: { deletedAt: new Date() } });
  }
  res.status(200).json({ success: true });
}

export async function publishAlert(req: Request, res: Response) {
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  if (report.removedAt) {
    return res.status(400).json({ error: 'Restore this report before publishing an alert for it.' });
  }

  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  const severity = SEVERITIES.includes(req.body.severity) ? req.body.severity : 'warning';
  const hours = Number(req.body.hours);

  if (title.length < 3 || title.length > 80) {
    return res.status(400).json({ error: 'The alert title must be 3 to 80 characters.' });
  }
  if (message.length < 3 || message.length > 300) {
    return res.status(400).json({ error: 'The alert message must be 3 to 300 characters.' });
  }

  const expiresAt = hours > 0 && hours <= 720 ? new Date(Date.now() + hours * 60 * 60 * 1000) : null;

  const alert = await prisma.notification.create({
    data: { userId: null, type: 'announcement', title, body: message, severity, reportId: report.id, expiresAt },
  });
  await prisma.auditLog.create({
    data: { userId: req.user!.sub, action: 'alert_published', detail: title },
  });

  res.status(201).json(alert);
}

export async function retractAlert(req: Request, res: Response) {
  await prisma.notification.deleteMany({
    where: { reportId: req.params.id, userId: null, type: 'announcement' },
  });
  res.status(200).json({ success: true });
}