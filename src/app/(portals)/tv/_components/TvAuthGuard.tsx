'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { isTokenExpired, readSchoolId } from '@/lib/auth/jwt';

const TV_LOGIN_PATH = '/tv/login';

/**
 * Session guard for the TV portal (KAN-30). TV runs fullscreen without
 * `PortalShell`, so it needs its own gate:
 *
 * - display routes without a live session → bounce to `/tv/login`;
 * - `/tv/login` with a live session → straight to the account's display
 *   (`/tv/<school_id>` from the JWT), so a kiosk reload lands back on its
 *   board without re-typing credentials.
 *
 * Runs in an effect (post-hydration of the persisted auth store) and
 * renders nothing.
 */
export function TvAuthGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const isLoginRoute = pathname === TV_LOGIN_PATH;
  const sessionAlive = !!accessToken && !isTokenExpired(accessToken);

  useEffect(() => {
    if (!isLoginRoute && !sessionAlive) {
      router.replace(TV_LOGIN_PATH);
      return;
    }
    if (isLoginRoute && sessionAlive && accessToken) {
      const schoolId = readSchoolId(accessToken);
      if (schoolId) {
        router.replace(`/tv/${schoolId}`);
      }
    }
  }, [isLoginRoute, sessionAlive, accessToken, router]);

  return null;
}
