import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const prisma = new PrismaClient();
const router = Router();

// ─── GET /bookings ─────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookings = await prisma.consultBooking.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// ─── POST /bookings ────────────────────────────────────────
const createSchema = z.object({
  hospital: z.string().min(1, 'Hospital is required'),
  doctor: z.string().min(1, 'Doctor is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
});

router.post(
  '/',
  validate(createSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { hospital, doctor, date, time } = req.body;

      const booking = await prisma.consultBooking.create({
        data: {
          userId: req.userId!,
          hospital,
          doctor,
          date,
          time,
        },
      });

      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  }
);

export { router as bookingsRouter };
