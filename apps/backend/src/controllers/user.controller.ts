import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function completeProfile(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { username, studentId, role } = req.body;

  const existingUsername = username
    ? await prisma.user.findUnique({ where: { username } })
    : null;
  if (existingUsername && existingUsername.id !== userId) {
    return res.status(409).json({ error: 'That username is already taken.' });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      username: username || null,
      studentId: studentId || null,
      role: role || 'STUDENT',
      profileCompleted: true,
    },
  });

  return res.status(200).json({
    id: updated.id,
    username: updated.username,
    studentId: updated.studentId,
    role: updated.role.toLowerCase(),
    profileCompleted: updated.profileCompleted,
  });
}