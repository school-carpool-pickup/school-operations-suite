import type { ApiEnvelope, Id } from './common';

/**
 * Wire shapes for `/api/v1/admin/schools/*` (owner-only).
 *
 * Mirrors backend `domain.School`. ⚠️ JSON-tag inconsistency: the response
 * serialises the email domain as `emailDomainName` (camelCase), while
 * create/update REQUESTS expect `email_domain_name` (snake_case). See
 * `backend-service/internal/modules/school/dto.go` +
 * `internal/shared/domain/school.go`.
 */
export interface AdminSchool {
  id: Id;
  name: string;
  emailDomainName: string;
  address?: string | null;
  logo_url?: string | null;
  created_at: string;
}

export interface AdminSchoolListParams {
  page?: number;
  size?: number;
  search?: string;
}

/** Paginated list response — pagination fields live on the envelope itself. */
export type AdminSchoolListResponse = ApiEnvelope<AdminSchool[]>;

/** Create/update payload. Note snake_case `email_domain_name` on write. */
export interface AdminSchoolInput {
  name: string;
  email_domain_name: string;
  address?: string;
  logo_url?: string;
}
