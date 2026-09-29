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
  /**
   * Per-gate queue geofence. When a lane carries coordinates the backend uses
   * THEM (not the school centre) to decide `prepare → queued`, so each gate
   * can sit where the cars actually stop. Absent on lanes created before the
   * fields existed — the backend then falls back to the school coordinates.
   */
  latitude?: number;
  longitude?: number;
  /** Radius in metres for the geofence above. Backend default: 20m. */
  queue_radius?: number;
  /** Eager-loaded full grade records. May be undefined when not requested. */
  grades?: AdminGrade[];
  /** ID-only form, present when the backend doesn't expand grades. */
  grade_ids?: number[];
}

export type AdminLaneListResponse = ApiEnvelope<AdminLane[]>;

export interface AdminLaneCreateInput {
  name: string;
  code: string;
  /** Queue-geofence latitude. The backend 400s unless longitude is sent too. */
  latitude?: number;
  /** Queue-geofence longitude. The backend 400s unless latitude is sent too. */
  longitude?: number;
  /** Radius in metres. Omit to let the backend apply its 20m default. */
  queue_radius?: number;
  /** Grades to attach. All must currently be unassigned or backend 409s. */
  grade_ids?: number[];
}

export interface AdminLaneUpdateInput {
  name: string;
  code: string;
  /** Queue-geofence latitude. The backend 400s unless longitude is sent too. */
  latitude?: number;
  /** Queue-geofence longitude. The backend 400s unless latitude is sent too. */
  longitude?: number;
  /** Radius in metres. Omit to let the backend apply its 20m default. */
  queue_radius?: number;
  /** Replaces the lane's full grade set (transactional on the backend). */
  grade_ids?: number[];
}
