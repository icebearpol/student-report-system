import { PrismaClient } from '@prisma/client';

// Prevents creating a new PrismaClient on every hot-reload during dev,
// which would otherwise exhaust your Postgres connection limit.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
