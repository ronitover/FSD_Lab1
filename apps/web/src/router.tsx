import { createBrowserRouter } from 'react-router';
import { RedirectIfSignedIn, RequireAuth } from './auth/guards.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.tsx';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage.tsx';
import { SignInPage } from './pages/auth/SignInPage.tsx';
import { SignUpPage } from './pages/auth/SignUpPage.tsx';
import { DashboardPlaceholder } from './pages/DashboardPlaceholder.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { RouteError } from './pages/RouteError.tsx';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        element: <RedirectIfSignedIn />,
        children: [
          { path: 'signin', element: <SignInPage /> },
          { path: 'signup', element: <SignUpPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      {
        element: <RequireAuth roles={['donor']} />,
        children: [{ path: 'donor', element: <DashboardPlaceholder /> }],
      },
      {
        element: <RequireAuth roles={['ngo']} />,
        children: [{ path: 'ngo', element: <DashboardPlaceholder /> }],
      },
      {
        element: <RequireAuth roles={['admin']} />,
        children: [{ path: 'admin', element: <DashboardPlaceholder /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
