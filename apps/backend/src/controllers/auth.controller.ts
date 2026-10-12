import crypto from 'crypto';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { sendVerificationEmail } from '../lib/mailer';

const JWT_SECRET = process.env.JWT_SECRET as string;
const TOKEN_EXPIRY = '7d';
const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase();
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

interface DbUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  username: string | null;
  studentId: string | null;
  profileCompleted: boolean;
  emailVerified: boolean;
  urgentBlocked: boolean;
}

function signToken(user: { id: string; role: string }) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function toAuthUser(user: DbUser, token: string) {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: user.role.toLowerCase(),
    username: user.username ?? undefined,
    studentId: user.studentId ?? undefined,
    profileCompleted: user.profileCompleted,
    emailVerified: user.emailVerified || user.role === 'ADMIN',
    urgentBlocked: user.urgentBlocked,
    token,
  };
}

function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashCode(userId: string, code: string) {
  return crypto.createHash('sha256').update(`${userId}:${code}`).digest('hex');
}

async function issueVerification(user: { id: string; email: string }) {
  const code = generateCode();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifyCodeHash: hashCode(user.id, code),
      verifyCodeExpires: new Date(Date.now() + CODE_TTL_MS),
      verifyCodeSentAt: new Date(),
      verifyAttempts: 0,
    },
  });
  return sendVerificationEmail(user.email, code);
}

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (ALLOWED_DOMAIN && !String(email).toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
    return res.status(400).json({ error: `Please sign up with your school email (@${ALLOWED_DOMAIN}).` });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const fullName = name && String(name).trim() ? String(name).trim() : String(email).split('@')[0];

  const user = await prisma.user.create({
    data: { email, passwordHash, fullName },
  });

  const emailSent = await issueVerification(user);
  return res.status(201).json({ ...toAuthUser(user, signToken(user)), emailSent });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  return res.status(200).json(toAuthUser(user, signToken(user)));
}

export async function verifyEmail(req: Request, res: Response) {
  const userId = req.user!.sub;
  const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }
  if (user.emailVerified) {
    return res.status(200).json(toAuthUser(user, signToken(user)));
  }
  if (!user.verifyCodeHash || !user.verifyCodeExpires || user.verifyCodeExpires < new Date()) {
    return res.status(400).json({ error: 'That code has expired. Request a new one.' });
  }
  if (user.verifyAttempts >= MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many incorrect attempts. Request a new code.' });
  }

  const supplied = Buffer.from(hashCode(user.id, code));
  const stored = Buffer.from(user.verifyCodeHash);
  const matches = supplied.length === stored.length && crypto.timingSafeEqual(supplied, stored);

  if (!matches) {
    await prisma.user.update({ where: { id: user.id }, data: { verifyAttempts: { increment: 1 } } });
    return res.status(400).json({ error: 'That code is not correct.' });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyCodeHash: null, verifyCodeExpires: null, verifyAttempts: 0 },
  });
  return res.status(200).json(toAuthUser(updated, signToken(updated)));
}

export async function resendCode(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }
  if (user.emailVerified) {
    return res.status(400).json({ error: 'Your email is already verified.' });
  }
  if (user.verifyCodeSentAt && Date.now() - user.verifyCodeSentAt.getTime() < RESEND_COOLDOWN_MS) {
    return res.status(429).json({ error: 'Please wait a minute before requesting another code.' });
  }

  const emailSent = await issueVerification(user);
  return res.status(200).json({ emailSent });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }
  return res.status(200).json(toAuthUser(user, signToken(user)));
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Please fill in both passwords.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Your new password must be at least 6 characters.' });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ error: 'Your new password must be different from the current one.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) {
    return res.status(403).json({ error: 'Your current password is not correct.' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });
  return res.status(200).json({ success: true });
}

export async function deleteAccount(req: Request, res: Response) {
  const { password } = req.body;
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Please enter your password to confirm.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }
  if (user.role === 'ADMIN') {
    return res.status(403).json({ error: 'Administrator accounts cannot be deleted from the app.' });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(403).json({ error: 'Your password is not correct.' });
  }

  await prisma.$transaction([
    prisma.report.updateMany({ where: { authorId: user.id }, data: { authorId: null, anonymous: true } }),
    prisma.reportComment.updateMany({ where: { authorId: user.id }, data: { authorId: null } }),
    prisma.notification.deleteMany({ where: { userId: user.id } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  return res.status(200).json({ success: true });
}