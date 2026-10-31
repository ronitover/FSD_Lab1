import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  // Comma-separated list of web origins allowed to call the API.
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
});

export type Env = z.infer<typeof schema>;

function loadEnv(): Env {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    // Fail at startup rather than on the first request that needs a missing value.
    console.error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
