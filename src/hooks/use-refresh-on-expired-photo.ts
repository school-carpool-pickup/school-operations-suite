'use client';

import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

/** At most one refresh per minute, however many photos fail at once. */
const MIN_INTERVAL_MS = 60_000;

/**
 * Photos on the pickup board are signed URLs that expire. When one fails to
 * load, refetch the list so the backend signs fresh ones.
 *
 * Throttled: a photo that is genuinely broken — not just expired — would
 * otherwise fail, refetch, and fail again in a loop.
 */
export function useRefreshOnExpiredPhoto(queryKey: QueryKey): () => void {
  const queryClient = useQueryClient();
  const last = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - last.current < MIN_INTERVAL_MS) return;
    last.current = now;
    void queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);
}
