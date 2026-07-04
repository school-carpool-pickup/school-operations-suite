'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';

/**
 * Signs the TV display out. The old logout was a plain `<Link>` to
 * `/tv/login`, which TvAuthGuard bounced straight back because the session
 * was still live — so the kiosk could never actually sign out. This clears
 * the session first, then navigates, so the guard lets `/tv/login` render.
 */
export function TvLogoutButton({
  className,
  children,
  title,
}: {
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  const handleLogout = () => {
    clearSession();
    router.replace('/tv/login');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className}
      title={title}
    >
      {children}
    </button>
  );
}
