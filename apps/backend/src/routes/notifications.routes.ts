import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { optionalAuth } from '../middleware/optionalAuth';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const now = new Date();
    const conditions: any[] = [
      { userId: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    ];
    if (req.user) {
      conditions.push({ userId: req.user.sub });
    }

    const items = await prisma.notification.findMany({
      where: { OR: conditions },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.status(200).json(
      items.map(({ id, type, title, body, severity, reportId, createdAt }) => ({
        id,
        type,
        title,
        body,
        severity,
        reportId,
        createdAt,
      }))
    );
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;