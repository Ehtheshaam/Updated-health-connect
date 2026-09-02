import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// ─── GET /providers ────────────────────────────────────────
router.get('/', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const providers = await prisma.provider.findMany();
    res.json(providers);
  } catch (err) {
    next(err);
  }
});

export { router as providersRouter };
