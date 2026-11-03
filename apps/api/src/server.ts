import { createApp } from './app.ts';
import { env } from './env.ts';
import { logger } from './logger.ts';

const server = createApp().listen(env.PORT, () => {
  logger.info(`RePlate API listening on http://localhost:${env.PORT}`);
});

// Let in-flight requests finish when the platform stops or redeploys the service.
function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
