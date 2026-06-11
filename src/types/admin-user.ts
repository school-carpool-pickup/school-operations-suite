import type { UserMe } from './auth';
import type { ApiEnvelope } from './common';

/**
 * Wire shapes for `/api/v1/admin/users/*` (internal-user CRM).
 *
 * Mirrors the backend's `domain.User` exactly (snake_case) — identical to
 * the `/users/me` shape. See
 * `backend-service/internal/modules/user/handler_admin.go` and
 * `internal/shared/domain/user.go`.
 */
export type AdminUser = UserMe;

export interface AdminUserListParams {
  page?: number;
  size?: number;
  search?: string;
}

/** Paginated list response — pagination fields live on the envelope itself. */
export type AdminUserListResponse = ApiEnvelope<AdminUser[]>;

/**
 * Invite a new internal user by email. The backend validates `oneof=staff`,
 * so only staff invitations are accepted through this endpoint.
 */
export interface AdminUserInviteInput {
  email: string;
  role: 'staff';
}

/**
 * Partial update for `PUT /admin/users/:id`. The backend validates the
 * `role`/`status` enums; all fields are optional.
 */
export interface AdminUserUpdateInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  line_id?: string;
  email?: string;
  role?: 'owner' | 'admin' | 'staff';
  status?: 'active' | 'pending' | 'suspended' | 'banned';
}

/** Self-service profile update for `PUT /admin/users/me`. */
export interface AdminUserUpdateMeInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  line_id?: string;
}

/** Change own password — `PUT /admin/users/me/password`. */
export interface AdminUserChangePasswordInput {
  current_password: string;
  new_password: string;
}
