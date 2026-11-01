import { createClient } from '@supabase/supabase-js';
import { config } from '../config.ts';

// The browser only ever holds the publishable key. Supabase Auth keeps the session in localStorage
// and refreshes the access token before it expires.
export const supabase = createClient(config.supabaseUrl, config.supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
