import type { UserMe } from './auth';
import type { ApiEnvelope, Id } from './common';

/**
 * Wire shapes for `/api/v1/admin/families/*`.
 *
 * Mirrors backend's `domain.Family` + `domain.User` exactly (snake_case).
 * See `backend-service/internal/modules/family/dto.go` and
 * `internal/shared/domain/family.go`.
 */

/** A family member is a `User` row joined to the family (same shape as /users/me). */
export type AdminFamilyMember = UserMe;

export interface AdminFamily {
  id: Id;
  family_name: string;
  joined_at: string;
  members: AdminFamilyMember[];
  school_id: Id;
  status: string;
}

export interface AdminFamilyListParams {
  page?: number;
  size?: number;
  search?: string;
  /** Backend currently only allows `status` here. */
  filter_field?: 'status';
  filter_value?: string;
}

/** Paginated list response — pagination fields live on the envelope itself. */
export type AdminFamilyListResponse = ApiEnvelope<AdminFamily[]>;

export interface AdminFamilyUpdateInput {
  family_name: string;
  /** Backend validates `oneof=active inactive`. */
  status: 'active' | 'inactive';
}

export interface AdminFamilyBulkDeleteInput {
  ids: Id[];
}
