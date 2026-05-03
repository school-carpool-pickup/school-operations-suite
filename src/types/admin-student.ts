import type { ApiEnvelope, Id } from './common';

/**
 * Wire shapes for `/api/v1/admin/students/*`.
 *
 * Mirrors backend's `domain.Student` exactly (snake_case). See
 * `backend-service/internal/modules/student/dto.go` and
 * `internal/shared/domain/student.go`.
 *
 * NOTE: The backend's update endpoint accepts all fields, but the school
 * UI treats most as read-only ("synced from school API") and only allows
 * editing `notes`. Emergency contact data exists as a domain struct but is
 * not yet exposed by any handler.
 */

export interface AdminStudent {
  id: Id;
  school_id: Id;
  family_id: Id;
  first_name: string;
  last_name: string;
  grade: string;
  section: string;
  school_email: string;
  date_of_birth: string;
  blood_type: string;
  photo_url: string;
  preferred_gate: string;
  photo_consent: boolean;
  /** Backend validates `oneof=enrolled graduated withdrawn`. */
  status: string;
  notes: string;
}

export interface AdminStudentListParams {
  page?: number;
  size?: number;
  search?: string;
  /** Backend currently only allows `grade` here. */
  filter_field?: 'grade';
  filter_value?: string;
}

export type AdminStudentListResponse = ApiEnvelope<AdminStudent[]>;

/**
 * PUT body — backend's required fields are first_name, last_name, grade,
 * section, school_email, photo_consent, status. Everything else optional.
 *
 * Even when the UI only edits `notes`, we must round-trip ALL of the
 * existing fields back to the backend (it's a full replace, not a patch).
 */
export interface AdminStudentUpdateInput {
  family_id?: Id;
  first_name: string;
  last_name: string;
  grade: string;
  section: string;
  school_email: string;
  date_of_birth?: string;
  blood_type?: string;
  photo_url?: string;
  preferred_gate?: string;
  photo_consent: boolean;
  status: 'enrolled' | 'graduated' | 'withdrawn';
  notes?: string;
}

export interface AdminStudentBulkDeleteInput {
  ids: Id[];
}
