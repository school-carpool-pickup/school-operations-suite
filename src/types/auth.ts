import type { Id } from './common';
import type { UserRole } from './enums';

/**
 * Backend uses an OAuth2-flavoured login. `grant_type=password` for
 * username/password, `grant_type=refresh_token` for token rotation,
 * `grant_type=assertion` for SSO-style tokens.
 */
export type GrantType = 'password' | 'refresh_token' | 'assertion';

export interface LoginRequest {
  grant_type: GrantType;
  client_id: string;
  /** Required when grant_type=password. */
  username?: string;
  /** Required when grant_type=password. */
  password?: string;
  /** Required when grant_type=refresh_token. */
  refresh_token?: string;
  /** Required when grant_type=assertion (SSO). */
  assertion?: string;
}

export interface LoginData {
  access_token: string;
  refresh_token: string;
  /** Seconds until the access token expires. */
  expires_in: number;
  token_type: string;
  user_id: string;
  roles: string[];
}

export interface ValidateData {
  valid: boolean;
  /** RBAC roles on the token (e.g. `owner`, `admin`, `staff`). */
  roles: string[];
  /** `feature.action` permission strings derived from the roles. */
  permissions: string[];
}

/**
 * Wire shape of `POST /api/v1/auth/register` — completes an emailed
 * invitation. Every field is required by the backend validator; the school
 * is resolved server-side from the email-domain of the token's `sub`, NOT
 * from its `school_id` claim. Responds 201 with `data: UserMe` (no session
 * tokens — the user signs in afterwards). Invalid/expired/used tokens come
 * back as HTTP 500 with `error.message` `"invalid credentials"` /
 * `"resource already exists"` (see backend `auth/handler.go` Register).
 */
export interface RegisterRequest {
  register_token: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

/**
 * Claims inside the emailed `register_token` (HS256, 24h expiry) minted by
 * the backend's `user/service_admin.go` InviteUser. Decoded client-side
 * (payload only, no signature check) to prefill the register page and
 * pre-empt expired-link submissions.
 */
export interface RegisterTokenClaims {
  /** Invitee email. */
  sub?: string;
  school_id?: string;
  /** Backend role: `owner` | `admin` | `staff` for internal invites. */
  role?: string;
  /** Always `register` for these links. */
  purpose?: string;
  exp?: number;
  iat?: number;
}

/**
 * Display-side user record. The backend's login response only gives us
 * `user_id` + `roles`; richer profile data (name, email) comes from
 * `GET /api/v1/users/me`. Before that call resolves, `name` falls back to
 * `user_id`.
 */
export interface User {
  id: Id;
  name: string;
  email: string;
  role: UserRole | string; // string fallback for legacy mock entries
}

/**
 * Wire shape of `GET /api/v1/users/me`. Mirrors the backend's
 * `domain.User` struct exactly (snake_case, optional fields where the
 * backend uses pointers). See
 * `backend-service/internal/shared/domain/user.go`.
 */
export interface UserMe {
  id: string;
  school_id: string;
  family_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  invite_status: string | null;
  line_id: string | null;
  profile_complete: boolean;
  last_login: string | null;
  created_at: string;
}
