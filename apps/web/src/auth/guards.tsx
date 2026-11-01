import { Navigate, Outlet, useLocation } from 'react-router';
import type { Role } from '@replate/shared';
import { FullPageError, FullPageSpinner } from '../components/ui/Feedback.tsx';
import { errorMessage } from '../lib/api.ts';
import { HOME_BY_ROLE, useAuth } from './context.ts';

/** Only lets signed-in users with one of `roles` through; everyone else is sent where they belong. */
export function RequireAuth({ roles }: { roles?: readonly Role[] }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') return <FullPageSpinner />;
  if (auth.status === 'error') {
    return <FullPageError message={errorMessage(auth.error)} onRetry={auth.retry} />;
  }
  if (auth.status === 'signed-out') {
    return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />;
  }
  if (roles && !roles.includes(auth.me.role)) {
    return <Navigate to={HOME_BY_ROLE[auth.me.role]} replace />;
  }
  return <Outlet />;
}

/** For sign-in and sign-up: someone already signed in goes back to where they were headed. */
export function RedirectIfSignedIn() {
  const auth = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  if (auth.status === 'loading') return <FullPageSpinner />;
  if (auth.status === 'signed-in')
    return <Navigate to={from ?? HOME_BY_ROLE[auth.me.role]} replace />;
  return <Outlet />;
}
