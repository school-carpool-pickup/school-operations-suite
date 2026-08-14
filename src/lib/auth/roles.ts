/**
 * Internal-role privilege ranks, mirroring the backend
 * (`internal/modules/user/service_admin.go` → `internalRoleRank`).
 *
 * The backend rule for invites is: "an inviter may only grant roles strictly
 * below their own privilege rank". Deriving the dropdown options from the
 * signed-in user's role keeps the UI from offering something the backend
 * would reject with 401 — e.g. an admin cannot create another admin.
 */
export const INTERNAL_ROLE_RANK: Record<string, number> = {
  owner: 4,
  admin: 3,
  staff: 2,
  screen_display: 1,
};

/** Roles `POST /admin/users` accepts (`oneof=admin staff screen_display`). */
export type InvitableRole = 'admin' | 'staff' | 'screen_display';

const INVITABLE_ROLES: InvitableRole[] = ['admin', 'staff', 'screen_display'];

/** Highest internal rank held by the signed-in user (0 when none). */
export function highestRoleRank(roles: string[]): number {
  return roles.reduce((max, r) => Math.max(max, INTERNAL_ROLE_RANK[r] ?? 0), 0);
}

/**
 * Roles the signed-in user may create, strictly below their own rank:
 * owner → admin, staff, screen_display; admin → staff, screen_display.
 */
export function invitableRoles(roles: string[]): InvitableRole[] {
  const rank = highestRoleRank(roles);
  return INVITABLE_ROLES.filter((r) => INTERNAL_ROLE_RANK[r] < rank);
}
