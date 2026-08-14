import type { ApiEnvelope, Id, ISODate } from './common';

/**
 * Wire shapes for the TV portal endpoints (`/api/v1/tv/*`), mirroring the
 * backend `tv` module DTOs.
 *
 * Both routes are guarded by `RolesScreenDashboard` (role `screen_display`)
 * and scoped to the school on the TV account's JWT — neither takes a school
 * id, so the `[schoolId]` route segment is only used for navigation.
 */

/** School identity shown in the TV header. */
export interface TvSchoolBrief {
  id: Id;
  name: string;
}

/** One selectable gate (lane) on the gate-selection screen. */
export interface TvGateItem {
  /** Lane's integer id — used as `:laneId` on the display route. */
  id: number;
  code: string;
  name: string;
  grades: string[];
  active_count: number;
}

/** `GET /v1/tv/gates` */
export interface TvGatesResponse {
  school: TvSchoolBrief;
  gates: TvGateItem[];
}

export type TvGatesEnvelope = ApiEnvelope<TvGatesResponse>;

export interface TvGateHeader {
  id: number;
  code: string;
  name: string;
}

export interface TvDisplayStats {
  in_queue: number;
  preparing: number;
}

export interface TvQueueStudent {
  name: string;
  grade: string;
}

/** Populated from the pickup's creator; may be empty until the backend fills it. */
export interface TvQueueParent {
  name: string;
  role: string;
}

export interface TvQueueVehicle {
  plate: string;
  brand: string;
  model: string;
  color: string;
  type: string;
}

/** Pickup status labels the TV shows (backend `stageToStatus`). */
export type TvQueueStatus = 'PREPARING' | 'IN_QUEUE';

export interface TvQueueItem {
  /** Pickup code (PU-YYYYMMDD-NNN). */
  id: string;
  status: TvQueueStatus | string;
  /** Always `INDIVIDUAL` until carpool ships. */
  type: string;
  students: TvQueueStudent[];
  parent: TvQueueParent;
  vehicle: TvQueueVehicle;
  queued_at?: ISODate | null;
}

/** `GET /v1/tv/gates/{laneId}/display` */
export interface TvDisplayResponse {
  gate: TvGateHeader;
  stats: TvDisplayStats;
  queue: TvQueueItem[];
}

export type TvDisplayEnvelope = ApiEnvelope<TvDisplayResponse>;
