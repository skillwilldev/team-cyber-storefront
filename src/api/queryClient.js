import { QueryClient } from '@tanstack/react-query';

/**
 * One QueryClient for the whole app = one shared cache.
 *
 * - staleTime: for 1 minute data is "fresh": going back to a page shows it instantly, no request.
 *   After that it is "stale": still shown from cache, but refetched in the background.
 * - gcTime: how long an UNUSED cache entry is kept in memory (default 5 min).
 * - retry: 4xx are answers, not failures (404 = not found) — retrying makes no sense.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
