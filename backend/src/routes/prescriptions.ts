import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const prisma = new PrismaClient();
const router = Router();

// ─── GET /prescriptions ────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });

    // Parse the medicines JSON string back to an array for the client
    const parsed = prescriptions.map((p) => ({
      ...p,
      medicines: JSON.parse(p.medicines),
    }));

    res.json(parsed);
  } catch (err) {
    next(err);
  }
});

// ─── POST /prescriptions ───────────────────────────────────
const createSchema = z.object({
  doctor: z.string().min(1, 'Doctor name is required'),
  date: z.string().min(1, 'Date is required'),
  medicines: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
      duration: z.string(),
    })
  ),
  instructions: z.string().min(1, 'Instructions are required'),
});

router.post(
  '/',
  validate(createSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { doctor, date, medicines, instructions } = req.body;

      const prescription = await prisma.prescription.create({
        data: {
          userId: req.userId!,
          doctor,
          date,
          medicines: JSON.stringify(medicines), // Store as JSON string
          instructions,
        },
      });

      res.status(201).json({
        ...prescription,
        medicines, // Return parsed version
      });
    } catch (err) {
      next(err);
    }
  }
);

export { router as prescriptionsRouter };
