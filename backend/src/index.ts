import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { symptomsRouter } from './routes/symptoms';
import { recordsRouter } from './routes/records';
import { prescriptionsRouter } from './routes/prescriptions';
import { providersRouter } from './routes/providers';
import { bookingsRouter } from './routes/bookings';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Standard middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Public routes
app.use('/auth', authRouter);

// Protected routes — all require JWT
app.use('/users', authMiddleware, usersRouter);
app.use('/symptoms', authMiddleware, symptomsRouter);
app.use('/records', authMiddleware, recordsRouter);
app.use('/prescriptions', authMiddleware, prescriptionsRouter);
app.use('/providers', authMiddleware, providersRouter);
app.use('/bookings', authMiddleware, bookingsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handler (must be last)
app.use(errorHandler);

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`🚀 HealthConnect API running on http://0.0.0.0:${PORT} (Local Network Accessible)`);
});

export default app;
