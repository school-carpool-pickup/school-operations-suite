import type { AdminGrade } from './admin-grade';
import type { ApiEnvelope, Id } from './common';

/**
 * Wire shapes for `/api/v1/admin/lanes/*`.
 *
 * Lane IDs are `int64`. Backend's GET-by-id eager-loads attached `Grade`
 * records via the `grades` array; the LIST endpoint returns the same
 * shape. See `backend-service/internal/modules/lane/dto.go` and
 * `internal/shared/domain/lane.go` (note backend uses `GradeIDS` —
 * uppercase plural — but JSON tag is `grade_ids`).
 */

export interface AdminLane {
  id: number;
  school_id: Id;
  name: string;
  code: string;
  /** Eager-loaded full grade records. May be undefined when not requested. */
  grades?: AdminGrade[];
  /** ID-only form, present when the backend doesn't expand grades. */
  grade_ids?: number[];
}

export type AdminLaneListResponse = ApiEnvelope<AdminLane[]>;

export interface AdminLaneCreateInput {
  name: string;
  code: string;
  /** Grades to attach. All must currently be unassigned or backend 409s. */
  grade_ids?: number[];
}

export interface AdminLaneUpdateInput {
  name: string;
  code: string;
  /** Replaces the lane's full grade set (transactional on the backend). */
  grade_ids?: number[];
}
