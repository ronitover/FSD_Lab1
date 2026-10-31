import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { env } from './env.ts';
import { logger } from './logger.ts';
import { requireAuth } from './middleware/auth.ts';
import { errorHandler, notFound } from './middleware/errors.ts';
import { adminRouter } from './routes/admin.ts';
import { donationsRouter } from './routes/donations.ts';
import { geocodeRouter } from './routes/geocode.ts';
import { healthRouter } from './routes/health.ts';
import { meRouter } from './routes/me.ts';

export function createApp() {
  const app = express();

  // Behind the hosting platform's proxy, so client IPs (used for rate limiting) come from X-Forwarded-For.
  if (env.NODE_ENV === 'production') app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(pinoHttp({ logger }));

  app.use('/api/health', healthRouter);

  // Everything below needs a signed-in user.
  app.use('/api', requireAuth);
  app.use('/api/me', meRouter);
  app.use('/api/donations', donationsRouter);
  app.use('/api/geocode', geocodeRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
