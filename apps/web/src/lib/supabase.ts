import { AuthClient } from '@supabase/auth-js';
import { config } from '../config.ts';

// The browser only talks to Supabase for sign-in; all data goes through the RePlate API. So this
// uses Supabase's auth client on its own rather than the full SDK, which would add storage,
// realtime and database clients the app never uses.
//
// It holds only the publishable key. The session lives in localStorage, under the same key the
// full SDK uses, and the access token is refreshed before it expires.
const projectRef = new URL(config.supabaseUrl).hostname.split('.')[0];

export const auth = new AuthClient({
  url: `${config.supabaseUrl}/auth/v1`,
  headers: {
    apikey: config.supabasePublishableKey,
    Authorization: `Bearer ${config.supabasePublishableKey}`,
  },
  storageKey: `sb-${projectRef}-auth-token`,
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
});
