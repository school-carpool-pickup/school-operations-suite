'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Skip retries on 4xx — auth failures (401/403) and validation errors (400)
 * won't change on a retry, and retrying just delays the redirect-to-login
 * triggered by the apiClient interceptor. Server errors (5xx) still get
 * the default exponential backoff up to 3 attempts.
 *
 * Queries only. Mutations must never retry: our POST/PUTs are not
 * idempotent (a 500 thrown after a successful write would duplicate the
 * record on retry), and the backend misreports some business errors as
 * 500 (e.g. duplicate school domain → ErrConflict is unmapped), which
 * made a duplicate-domain create fire 4 identical POSTs and hang the
 * submit button through ~7s of backoff before showing the error.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < 3;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: shouldRetry,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
