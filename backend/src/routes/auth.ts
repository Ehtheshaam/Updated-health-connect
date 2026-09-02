import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middleware/validate';

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'healthconnect-demo-secret-change-me';

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

/** Strip passwordHash before sending user to the client */
function sanitizeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// ─── Register ──────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  age: z.string().optional().default(''),
  gender: z.string().optional().default(''),
  address: z.string().optional().default(''),
  emergencyContact: z.string().optional().default(''),
  userType: z.enum(['patient', 'healthWorker']).optional().default('patient'),
});

router.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, phone, password, age, gender, address, emergencyContact, userType } = req.body;

      // Check if user already exists
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        res.status(409).json({ error: 'A user with this phone number already exists' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { name, phone, passwordHash, age, gender, address, emergencyContact, userType },
      });

      const token = signToken(user.id);

      res.status(201).json({ token, user: sanitizeUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Login ─────────────────────────────────────────────────
const loginSchema = z.object({
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().min(1, 'Password is required'),
});

router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, password } = req.body;

      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        res.status(401).json({ error: 'Invalid phone or password' });
        return;
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        res.status(401).json({ error: 'Invalid phone or password' });
        return;
      }

      const token = signToken(user.id);

      res.json({ token, user: sanitizeUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

export { router as authRouter };
