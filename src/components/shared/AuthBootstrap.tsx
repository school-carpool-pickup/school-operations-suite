'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { isTokenExpired } from '@/lib/auth/jwt';

/**
 * Runs once on app mount. Drops the persisted session if the access token
 * has already expired locally — saves a doomed upstream call and bounces
 * stale logins to /login on the next protected route.
 *
 * Note: we previously called `GET /api/v1/auth/validate` here, but that
 * upstream endpoint is currently broken — see
 * `backend-service/internal/modules/auth/handler.go:47`:
 *
 *     auths := strings.SplitN(auth, " ", 1)   // n=1 returns ["Bearer xyz"]
 *     if len(auths) != 2 { return Unauthorized }
 *
 * `SplitN(s, sep, 1)` returns the whole string in one element, so the
 * length check always fires and validate replies 401 for every token.
 * Until backend ships `n=2`, we rely on:
 *   1. local `exp` claim check here, and
 *   2. the apiClient response interceptor (401/403 → clearSession).
 */
export function AuthBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    if (!accessToken) return;
    ranRef.current = true;

    if (isTokenExpired(accessToken)) {
      clearSession();
    }
  }, [accessToken, clearSession]);

  return null;
}
