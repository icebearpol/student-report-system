import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  sub: string;
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN' | 'PREFER_NOT_TO_SAY';
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Any route using this middleware requires a valid, non-expired JWT
// in the Authorization header: "Bearer <token>"
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (error) {
    // This is the exact 401 your frontend's HTTP interceptor should
    // watch for — on seeing this, clear local storage and route back
    // to the login screen.
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
