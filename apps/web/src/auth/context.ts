import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Me, Role } from '@replate/shared';

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  /** Signed in, but the profile couldn't be loaded (for example, the API is down). */
  | { status: 'error'; session: Session; error: unknown; retry: () => void }
  | { status: 'signed-in'; session: Session; me: Me };

export type AuthContextValue = AuthState & { signOut: () => Promise<void> };

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.');
  return value;
}

/** The signed-in user's profile. Only for screens behind <RequireAuth>. */
export function useMe(): Me {
  const auth = useAuth();
  if (auth.status !== 'signed-in') throw new Error('useMe needs a signed-in user.');
  return auth.me;
}

export const ME_QUERY_KEY = ['me'] as const;

/** Where each role lands after signing in. */
export const HOME_BY_ROLE: Record<Role, string> = {
  donor: '/donor',
  ngo: '/ngo',
  admin: '/admin',
};
