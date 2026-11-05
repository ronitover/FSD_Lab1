import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { MotionProvider } from './components/motion/MotionProvider.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { queryClient } from './lib/queryClient.ts';
import { router } from './router.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MotionProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </MotionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
