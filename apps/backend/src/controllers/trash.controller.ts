import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const RETENTION_DAYS = Number(process.env.REMOVED_RETENTION_DAYS) || 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function removeUpload(imageUrl?: string | null) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
  const file = path.join(process.cwd(), 'uploads', path.basename(imageUrl));
  fs.promises.unlink(file).catch(() => {});
}

export async function listRemoved(_req: Request, res: Response) {
  const rows = await prisma.report.findMany({
    where: { removedAt: { not: null } },
    orderBy: { removedAt: 'desc' },
    include: { author: { select: { id: true, fullName: true, username: true, email: true } } },
  });

  const now = Date.now();
  const items = rows.map((r) => {
    const removedAt = r.removedAt as Date;
    const purgeAt = new Date(removedAt.getTime() + RETENTION_DAYS * DAY_MS);
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      location: r.location,
      category: r.category,
      status: r.status,
      priority: r.priority,
      imageUrl: r.imageUrl,
      createdAt: r.createdAt,
      removedAt,
      removedReason: r.removedReason,
      purgeAt,
      daysLeft: Math.max(0, Math.ceil((purgeAt.getTime() - now) / DAY_MS)),
      author: r.author,
    };
  });

  res.status(200).json({ retentionDays: RETENTION_DAYS, items });
}

export async function deletePermanently(req: Request, res: Response) {
  const report = await prisma.report.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { email: true } } },
  });
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  if (!report.removedAt) {
    return res.status(400).json({ error: 'Remove this report first. Only removed reports can be deleted permanently.' });
  }

  await prisma.report.delete({ where: { id: report.id } });
  removeUpload(report.imageUrl);
  await prisma.auditLog.create({
    data: {
      userId: req.user!.sub,
      action: 'report_deleted_permanently',
      detail: `"${report.title}" (${report.author?.email || 'guest'}) - ${report.removedReason || ''}`,
    },
  });

  res.status(200).json({ success: true });
}

export async function purgeExpired() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * DAY_MS);
  const expired = await prisma.report.findMany({ where: { removedAt: { lt: cutoff } } });
  if (expired.length === 0) return 0;

  for (const report of expired) {
    await prisma.report.delete({ where: { id: report.id } });
    removeUpload(report.imageUrl);
  }
  await prisma.auditLog.create({
    data: {
      action: 'reports_purged',
      detail: `${expired.length} removed report(s) older than ${RETENTION_DAYS} days were deleted automatically.`,
    },
  });
  return expired.length;
}

export function startPurgeJob() {
  const run = () => {
    purgeExpired()
      .then((count) => {
        if (count > 0) console.log(`[purge] deleted ${count} expired removed report(s)`);
      })
      .catch((error) => console.error('[purge] failed:', error));
  };
  run();
  setInterval(run, HOUR_MS);
}