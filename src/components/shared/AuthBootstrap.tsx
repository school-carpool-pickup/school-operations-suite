'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { apiKeys, useApi } from '@/lib/api';
import { isTokenExpired } from '@/lib/auth/jwt';
import type { ApiEnvelope, ValidateData } from '@/types';

/**
 * Runs on app mount for an authenticated session:
 *
 *   1. Drops a locally-expired token before any upstream call (saves a doomed
 *      request and bounces stale logins to /login on the next protected route).
 *   2. Calls `GET /api/v1/auth/validate` to hydrate the RBAC `roles` +
 *      `permissions` used to show/hide UI (`useCan`).
 *
 * Validate is exempt from the apiClient's 401→logout interceptor (see
 * `lib/api/client.ts`), so a failed/blocked validate never logs the user out —
 * permissions just stay empty. (The backend handler that historically always
 * returned 401 has since been fixed to return `{ valid, roles, permissions }`.)
 */
export function AuthBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setRbac = useAuthStore((s) => s.setRbac);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    if (!accessToken) return;
    ranRef.current = true;

    if (isTokenExpired(accessToken)) {
      clearSession();
    }
  }, [accessToken, clearSession]);

  const enabled = !!accessToken && !isTokenExpired(accessToken);
  const validateQuery = useApi<ApiEnvelope<ValidateData>>(
    apiKeys.auth.validate(),
    { enabled, staleTime: 5 * 60 * 1000 },
  );

  const validated = validateQuery.data?.data;
  useEffect(() => {
    if (validated) {
      setRbac(validated.roles ?? [], validated.permissions ?? []);
    }
  }, [validated, setRbac]);

  return null;
}
