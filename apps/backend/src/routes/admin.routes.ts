import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { listRemoved, deletePermanently } from '../controllers/trash.controller';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/audit', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, email: true, username: true, fullName: true, studentId: true } },
      },
    });
    res.status(200).json(logs);
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/users/:id/strikes', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { urgentStrikes: 0, urgentBlocked: false },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: 'strikes_reset', detail: user.email },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Reset strikes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/removed', async (req, res) => {
  try {
    await listRemoved(req, res);
  } catch (error) {
    console.error('List removed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/removed/:id', async (req, res) => {
  try {
    await deletePermanently(req, res);
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;