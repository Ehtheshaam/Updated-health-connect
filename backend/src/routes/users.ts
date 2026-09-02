import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const prisma = new PrismaClient();
const router = Router();

/** Strip passwordHash before sending user to the client */
function sanitizeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// ─── GET /users/me ─────────────────────────────────────────
router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
});

// ─── PUT /users/me ─────────────────────────────────────────
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  userType: z.enum(['patient', 'healthWorker']).optional(),
});

router.put(
  '/me',
  validate(updateSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.update({
        where: { id: req.userId },
        data: req.body,
      });
      res.json(sanitizeUser(user));
    } catch (err) {
      next(err);
    }
  }
);

export { router as usersRouter };
