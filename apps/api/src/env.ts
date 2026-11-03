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
  SUPABASE_URL: z.url(),
  // The server never needs the secret key: every query runs as the signed-in user.
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  // Nominatim's usage policy asks for an identifying User-Agent with a way to reach the operator.
  NOMINATIM_URL: z.url().default('https://nominatim.openstreetmap.org'),
  NOMINATIM_CONTACT: z.string().trim().min(1).default('RePlate (contact not configured)'),
  // Comma-separated ISO country codes to restrict address search to, e.g. "in". Empty searches worldwide.
  NOMINATIM_COUNTRY_CODES: z.string().trim().default(''),
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
