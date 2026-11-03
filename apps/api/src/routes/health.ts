import { Router } from 'express';
import type { HealthResponse } from '@replate/shared';

export const healthRouter = Router();

// Used by the hosting platform's health checks and by the web app to confirm the API is up.
healthRouter.get('/', (_req, res) => {
  const response: HealthResponse = { status: 'ok', uptimeSeconds: Math.round(process.uptime()) };
  res.json(response);
});
