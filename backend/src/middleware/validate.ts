import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Generic Zod validation middleware factory.
 * Usage: router.post('/route', validate(myZodSchema), handler)
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Throw ZodError so the centralized error handler catches it
      throw result.error;
    }
    req.body = result.data; // Replace body with parsed (and sanitized) data
    next();
  };
}
