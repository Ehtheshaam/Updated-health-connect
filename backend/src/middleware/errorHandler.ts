import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('❌ Error:', err.message);

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Prisma known request errors (e.g. unique constraint violation)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: 'A record with that value already exists',
        details: err.meta,
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    res.status(400).json({ error: 'Database error', details: err.message });
    return;
  }

  // Fallback
  res.status(500).json({ error: 'Internal server error' });
}
