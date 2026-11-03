import { QueryClient } from '@tanstack/react-query';
import { ApiRequestError } from './api.ts';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retrying won't fix a 4xx (bad request, forbidden, not found), only network and server errors.
      retry: (failureCount, error) =>
        failureCount < 2 &&
        !(error instanceof ApiRequestError && error.status >= 400 && error.status < 500),
    },
  },
});
