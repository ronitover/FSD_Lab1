import { createBrowserRouter } from 'react-router';
import { RedirectIfSignedIn, RequireAuth } from './auth/guards.tsx';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { FullPageSpinner } from './components/ui/Feedback.tsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.tsx';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage.tsx';
import { SignInPage } from './pages/auth/SignInPage.tsx';
import { SignUpPage } from './pages/auth/SignUpPage.tsx';
import { DashboardPlaceholder } from './pages/DashboardPlaceholder.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { RequireVerifiedNgo } from './pages/ngo/RequireVerifiedNgo.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { RouteError } from './pages/RouteError.tsx';

// Signed-in screens are loaded on first visit, so the landing and sign-in pages stay small.
// The map library only downloads with the screens that use it.
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <FullPageSpinner />,
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
        children: [
          {
            path: 'donor',
            lazy: async () => ({
              Component: (await import('./pages/donor/DonorDashboardPage.tsx')).DonorDashboardPage,
            }),
          },
          {
            path: 'donor/donations',
            lazy: async () => ({
              Component: (await import('./pages/donor/MyDonationsPage.tsx')).MyDonationsPage,
            }),
          },
          {
            path: 'donor/donations/new',
            lazy: async () => ({
              Component: (await import('./pages/donor/NewDonationPage.tsx')).NewDonationPage,
            }),
          },
          {
            path: 'donor/donations/:id/edit',
            lazy: async () => ({
              Component: (await import('./pages/donor/EditDonationPage.tsx')).EditDonationPage,
            }),
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: 'donations/:id',
            lazy: async () => ({
              Component: (await import('./pages/donations/DonationDetailPage.tsx'))
                .DonationDetailPage,
            }),
          },
        ],
      },
      {
        element: <RequireAuth roles={['ngo']} />,
        children: [
          {
            element: <RequireVerifiedNgo />,
            children: [
              {
                path: 'ngo',
                lazy: async () => ({
                  Component: (await import('./pages/ngo/FindFoodPage.tsx')).FindFoodPage,
                }),
              },
              {
                path: 'ngo/pickups',
                lazy: async () => ({
                  Component: (await import('./pages/ngo/PickupsPage.tsx')).PickupsPage,
                }),
              },
            ],
          },
        ],
      },
      {
        element: <RequireAuth roles={['admin']} />,
        children: [{ path: 'admin', element: <DashboardPlaceholder /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
