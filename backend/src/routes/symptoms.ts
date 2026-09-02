import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { analyzeSymptoms } from '../lib/symptomEngine';

const prisma = new PrismaClient();
const router = Router();

// ─── POST /symptoms ────────────────────────────────────────
const createSchema = z.object({
  symptoms: z.string().min(1, 'Symptoms text is required'),
  duration: z.string().optional().default(''),
  severity: z.enum(['mild', 'moderate', 'severe']),
});

router.post(
  '/',
  validate(createSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { symptoms, duration, severity } = req.body;

      // Run server-side rule engine
      const analysis = analyzeSymptoms(symptoms, severity, duration);

      const report = await prisma.symptomReport.create({
        data: {
          userId: req.userId!,
          symptoms,
          duration,
          severity,
          disease: analysis.disease,
          recommendation: analysis.recommendation,
          confidence: analysis.confidence,
        },
      });

      res.status(201).json(report);
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /symptoms ─────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reports = await prisma.symptomReport.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (err) {
    next(err);
  }
});

export { router as symptomsRouter };
