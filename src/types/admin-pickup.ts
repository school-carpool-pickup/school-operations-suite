import type { ApiEnvelope, Id, ISODate } from './common';

/**
 * Wire shapes for `GET /api/v1/admin/pickup` (note: singular `pickup`).
 * Mirrors backend `pickup/dto.go` → `AdminPickupListResponse`. Allowed for
 * RolesInternalLevel4 (owner/admin/staff/screen_display). Enveloped with
 * page/size/total/totalPage like the other admin lists.
 */

/** `stage` values — see backend `AdminPickupListResponse.Stage`. */
export const AdminPickupStage = {
  Active: 0,
  Prepare: 1,
  Queued: 2,
  Completed: 3,
} as const;
export type AdminPickupStage =
  (typeof AdminPickupStage)[keyof typeof AdminPickupStage];

export interface AdminPickupStudent {
  id: Id;
  first_name: string;
  last_name: string;
  grade: string;
  section: string;
}

export interface AdminPickupVehicle {
  id: Id;
  license_plate: string;
  brand: string;
  model: string;
  color: string;
  /** `private` | `taxi` | `walking`. */
  vehicle_type: string;
}

export interface AdminPickupFamily {
  id: Id;
  family_name: string;
}

export interface AdminPickup {
  id: Id;
  /** Human-readable code (PU-YYYYMMDD-NNN); may be absent pre-queue. */
  pickup_code?: string | null;
  stage: AdminPickupStage | number;
  /** Human-readable stage ("Queued", "Completed", …). */
  stage_label: string;
  lane?: string | null;
  vehicle: AdminPickupVehicle;
  students: AdminPickupStudent[];
  family: AdminPickupFamily;
  queued_at?: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
}

/**
 * Query params. `statuses` is a repeated param on the backend; the flat
 * `ApiKey.query` record can send a single value, which Fiber parses as a
 * one-element slice — enough for the board's single-select filter.
 */
export interface AdminPickupListParams {
  page?: number;
  size?: number;
  /** Matches student name, parent name, status label, or lane. */
  search?: string;
  order_by?: 'created_at' | 'updated_at' | 'queued_at';
  order_dir?: 'asc' | 'desc';
  lane_id?: string;
  /** One of the `stage_label` values (active|prepare|queued|completed|cancelled). */
  statuses?: string;
}

export type AdminPickupListResponse = ApiEnvelope<AdminPickup[]>;

/** Wire shape of `GET /api/v1/admin/pickup/summary` — counts per stage. */
export interface AdminPickupSummary {
  status: {
    active: number;
    prepare: number;
    queued: number;
    completed: number;
    cancelled: number;
  };
}

export type AdminPickupSummaryResponse = ApiEnvelope<AdminPickupSummary>;
