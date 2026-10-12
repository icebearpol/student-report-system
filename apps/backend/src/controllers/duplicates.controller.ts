import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { aiEnabled, findDuplicateWithAI, type DuplicateCandidate } from '../lib/aiModeration';

const HOUR_MS = 60 * 60 * 1000;
const LOOKBACK_DAYS = 60;
const POOL_SIZE = 80;
const MAX_CANDIDATES = 8;
const CHECK_WINDOW_MS = 10 * 60 * 1000;
const CHECK_LIMIT = 12;
const MAP_ASPECT_Y = 1512 / 2459;
const checkHits = new Map<string, number[]>();

function checkLimited(key: string) {
  const now = Date.now();
  const recent = (checkHits.get(key) || []).filter((t) => now - t < CHECK_WINDOW_MS);
  recent.push(now);
  checkHits.set(key, recent);
  return recent.length > CHECK_LIMIT;
}

function words(text: string) {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2)
  );
}

function overlap(a: Set<string>, b: Set<string>) {
  let count = 0;
  a.forEach((w) => {
    if (b.has(w)) count += 1;
  });
  return count;
}

function distanceLabel(
  ax?: number | null,
  ay?: number | null,
  bx?: number | null,
  by?: number | null
): DuplicateCandidate['distance'] {
  if (ax == null || ay == null || bx == null || by == null) return 'unknown';
  const d = Math.hypot(ax - bx, (ay - by) * MAP_ASPECT_Y);
  if (d < 0.03) return 'very close';
  if (d < 0.08) return 'nearby';
  return 'far';
}

export async function checkDuplicates(req: Request, res: Response) {
  const { title, description, location, category, mapX, mapY } = req.body;
  if (typeof title !== 'string' || typeof description !== 'string' || !title.trim() || !description.trim()) {
    return res.status(400).json({ error: 'Please describe the issue first.' });
  }
  if (!aiEnabled) {
    return res.status(200).json({ available: false });
  }

  const key = req.user ? `u:${req.user.sub}` : `ip:${req.ip}`;
  if (checkLimited(key)) {
    return res.status(200).json({ available: false });
  }

  const pool = await prisma.report.findMany({
    where: {
      removedAt: null,
      flagged: false,
      status: { not: 'resolved' },
      createdAt: { gte: new Date(Date.now() - LOOKBACK_DAYS * 24 * HOUR_MS) },
    },
    orderBy: { createdAt: 'desc' },
    take: POOL_SIZE,
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      category: true,
      upvotes: true,
      status: true,
      mapX: true,
      mapY: true,
      createdAt: true,
    },
  });

  const newWords = words(`${title} ${description}`);
  const newLocation = String(location || '').trim().toLowerCase();
  const newLocationWords = words(newLocation);
  const hasPin = typeof mapX === 'number' && typeof mapY === 'number';

  const scored = pool.map((r) => {
    let score = 0;
    if (category && r.category === category) score += 2;
    const rLocation = (r.location || '').trim().toLowerCase();
    if (newLocation && rLocation === newLocation) score += 3;
    else if (overlap(newLocationWords, words(rLocation)) > 0) score += 2;
    if (hasPin && distanceLabel(mapX, mapY, r.mapX, r.mapY) !== 'far') {
      if (r.mapX != null && r.mapY != null) score += 3;
    }
    score += Math.min(overlap(newWords, words(`${r.title} ${r.description}`)), 3);
    return { report: r, score };
  });

  const shortlist = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATES);

  if (shortlist.length === 0) {
    return res.status(200).json({ available: true, match: null });
  }

  const candidates: DuplicateCandidate[] = shortlist.map(({ report: r }) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    location: r.location || '',
    category: r.category || 'other',
    distance: hasPin ? distanceLabel(mapX, mapY, r.mapX, r.mapY) : 'unknown',
    ageHours: Math.max(0, Math.round((Date.now() - r.createdAt.getTime()) / HOUR_MS)),
  }));

  const verdict = await findDuplicateWithAI(
    { title, description, location: String(location || ''), category: String(category || 'other') },
    candidates
  );

  if (!verdict.ok) {
    return res.status(200).json({ available: false });
  }
  if (!verdict.matchId) {
    return res.status(200).json({ available: true, match: null });
  }

  const matched = shortlist.find((s) => s.report.id === verdict.matchId)?.report;
  if (!matched) {
    return res.status(200).json({ available: true, match: null });
  }

  res.status(200).json({
    available: true,
    match: {
      id: matched.id,
      title: matched.title,
      description: matched.description,
      location: matched.location,
      upvotes: matched.upvotes,
      status: matched.status,
      createdAt: matched.createdAt,
    },
    confidence: verdict.confidence,
    reason: verdict.reason,
  });
}