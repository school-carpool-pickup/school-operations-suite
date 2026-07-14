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
  /**
   * Target school. The backend's `GET /admin/users` scopes by the caller's
   * JWT school and has no `?school_id=` param yet, so this is IGNORED
   * server-side today. Sent forward-compatibly so the business portal (owner
   * has no JWT school) lights up once BE adds school-scoped listing.
   */
  school_id?: string;
}

/** Paginated list response — pagination fields live on the envelope itself. */
export type AdminUserListResponse = ApiEnvelope<AdminUser[]>;

/**
 * Create an internal user directly (admin & business portals). Not an email
 * invite: the backend creates the account immediately and emails a temporary
 * password the user changes on first login — no accept-invite step.
 * `first_name`/`last_name`/`email` are required; `phone`, when given, is the
 * local `0XXXXXXXXX` format (BE validates numeric, len 10, starts with 0) and
 * may be omitted. `school_id` targets the school and is optional — the business
 * owner's token carries no JWT school so the backend resolves it from this
 * field, while an admin's token already scopes the new user to their school.
 * All fields go in the body of `POST /admin/users`.
 */
export interface AdminUserCreateInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff';
  school_id?: string;
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
