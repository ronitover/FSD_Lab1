import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@supabase/supabase-js';
import type { Me } from '@replate/shared';
import { api } from '../lib/api.ts';
import { supabase } from '../lib/supabase.ts';
import { AuthContext, ME_QUERY_KEY, type AuthContextValue, type AuthState } from './context.ts';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // undefined until Supabase has read the stored session (or one from an email link).
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const userId = session?.user.id;

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      // Never show one account's data to the next person on this browser.
      if (!next) queryClient.clear();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const me = useQuery({
    queryKey: [...ME_QUERY_KEY, userId],
    queryFn: ({ signal }) => api<Me>('/me', { signal }),
    enabled: Boolean(userId),
    staleTime: 5 * 60_000,
  });

  const value = useMemo<AuthContextValue>(() => {
    let state: AuthState;
    if (session === undefined) state = { status: 'loading' };
    else if (session === null) state = { status: 'signed-out' };
    else if (me.data) state = { status: 'signed-in', session, me: me.data };
    else if (me.isError) {
      state = { status: 'error', session, error: me.error, retry: () => void me.refetch() };
    } else state = { status: 'loading' };

    return {
      ...state,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [session, me]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
