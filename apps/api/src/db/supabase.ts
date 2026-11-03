import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env.ts';
import type { Database } from './database.types.ts';

export type Db = SupabaseClient<Database>;

// Server-side clients never store sessions; every request brings its own access token.
const serverAuth = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };

/** Verifies access tokens. Holds no user session of its own. */
export const authClient: Db = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: serverAuth,
  },
);

/**
 * A client that acts as the signed-in user, so Row Level Security applies to every query.
 * Route handlers should use this one.
 */
export function createUserClient(accessToken: string): Db {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: serverAuth,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
