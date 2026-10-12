import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET) as any;
  } catch {
    req.user = undefined;
  }
  next();
}