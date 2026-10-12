import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/call', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }
    if (!user.emailVerified && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Verify your school email before contacting campus staff.' });
    }

    const contact = typeof req.body.contact === 'string' ? req.body.contact.slice(0, 80) : 'unknown';
    await prisma.auditLog.create({
      data: { userId: user.id, action: 'emergency_contact', detail: contact },
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Emergency log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;