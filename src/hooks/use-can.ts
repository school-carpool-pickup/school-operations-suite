'use client';

import { useAuthStore } from '@/hooks/use-auth-store';

/**
 * RBAC helpers backed by the session's `permissions` (hydrated from
 * `GET /auth/validate` in `AuthBootstrap`). The backend enforces access by
 * ROLE; these `feature.action` permission strings exist purely so the UI can
 * show/hide controls. Treat permissions as a set — order is not guaranteed.
 *
 *   const canInvite = useCan('user.create');
 *   {canInvite && <InviteButton />}
 */
export function usePermissions(): string[] {
  return useAuthStore((s) => s.permissions);
}

export function useRoles(): string[] {
  return useAuthStore((s) => s.roles);
}

/** True when the session holds the given `feature.action` permission. */
export function useCan(permission: string): boolean {
  return useAuthStore((s) => s.permissions.includes(permission));
}

/** True when the session holds ANY of the given permissions. */
export function useCanAny(permissions: string[]): boolean {
  return useAuthStore((s) =>
    permissions.some((p) => s.permissions.includes(p)),
  );
}

/**
 * Non-reactive check for use outside React render (event handlers, guards).
 * Prefer `useCan` inside components so the UI re-renders on change.
 */
export function can(permission: string): boolean {
  return useAuthStore.getState().permissions.includes(permission);
}
