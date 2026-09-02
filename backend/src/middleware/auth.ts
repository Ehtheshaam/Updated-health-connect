import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'healthconnect-demo-secret-change-me';

// Extend Express Request to carry userId after auth
export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
