import type { PortalIdentifier } from '@/config/portals';

/**
 * Maps each back-office portal to the matching `client_id` accepted by the
 * backend's OAuth login endpoint (see `backend-service` →
 * `internal/modules/auth/dto.go` validator tag `oneof=…`).
 *
 * Note: `stuff_crm` is the backend's literal value (typo for "staff"). Don't
 * "fix" it on this side — the backend allow-list rejects anything else.
 */
export const PORTAL_CLIENT_ID: Record<PortalIdentifier, string> = {
  admin: 'admin_crm',
  staff: 'stuff_crm',
  business: 'business_crm',
  tv: 'dashboard_crm',
};

/**
 * Resolve the right `client_id` for a redirect URL or portal id.
 * Falls back to the `NEXT_PUBLIC_AUTH_CLIENT_ID` env override, then to
 * `admin_crm` (the most common back-office entry point).
 */
export function resolveClientId(redirectOrPortal?: string): string {
  if (redirectOrPortal) {
    for (const [portal, clientId] of Object.entries(PORTAL_CLIENT_ID)) {
      if (
        redirectOrPortal === portal ||
        redirectOrPortal.startsWith(`/${portal}`)
      ) {
        return clientId;
      }
    }
  }

  const fromEnv = process.env.NEXT_PUBLIC_AUTH_CLIENT_ID;
  if (fromEnv) return fromEnv;

  return PORTAL_CLIENT_ID.admin;
}
