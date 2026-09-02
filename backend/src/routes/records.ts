import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const prisma = new PrismaClient();
const router = Router();

// ─── GET /records ──────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const records = await prisma.healthRecord.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (err) {
    next(err);
  }
});

// ─── POST /records ─────────────────────────────────────────
const createSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  date: z.string().min(1, 'Date is required'),
  doctor: z.string().min(1, 'Doctor name is required'),
  results: z.string().min(1, 'Results are required'),
  fileUrl: z.string().optional(),
});

router.post(
  '/',
  validate(createSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const record = await prisma.healthRecord.create({
        data: {
          userId: req.userId!,
          ...req.body,
        },
      });
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }
);

export { router as recordsRouter };
