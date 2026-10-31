import { pino } from 'pino';
import { env } from './env.ts';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  // Readable output locally; JSON lines in production for the hosting platform's log search.
  transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});
