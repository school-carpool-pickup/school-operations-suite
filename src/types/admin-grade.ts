import type { ApiEnvelope, Id } from './common';

/**
 * Wire shapes for `/api/v1/admin/grades/*`.
 *
 * Backend uses `int64` for grade IDs (autoincrement), unlike the UUID-based
 * resources elsewhere. We mirror that as `number`. See
 * `backend-service/internal/modules/grade/dto.go` and
 * `internal/shared/domain/grade.go`.
 */

export interface AdminGrade {
  id: number;
  school_id: Id;
  name: string;
  /** `null` when the grade hasn't been assigned to a lane yet. */
  lane_id: number | null;
}

export interface AdminGradeListParams {
  /** Filter to only grades that have no lane assignment. */
  is_unassigned?: boolean;
}

export type AdminGradeListResponse = ApiEnvelope<AdminGrade[]>;

export interface AdminGradeCreateInput {
  name: string;
}

export interface AdminGradeUpdateInput {
  name: string;
  /** Set/clear the grade's lane. `null` clears the assignment. */
  lane_id?: number | null;
}
