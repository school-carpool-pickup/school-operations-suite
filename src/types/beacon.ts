import type { ApiEnvelope, ISODate } from './common';

/**
 * Wire shapes for `/api/v1/admin/beacons` (KAN-51). Read is allowed for
 * internal roles (owner/admin/staff/screen_display); create/update/delete
 * are owner-only. The `business_crm` owner has NO school in its JWT, so the
 * list REQUIRES a `school_id` query param and the UI must pick a school.
 * Mirrors backend `domain.Beacon`.
 */
export interface AdminBeacon {
  /** Device identifier (also the primary key). */
  id: string;
  name: string;
  is_active: boolean;
  school_id: string;
  /** Installed lane; null/absent when unassigned. */
  lane_id?: number | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface AdminBeaconListParams {
  /** Required for the business owner (no school in the JWT). */
  school_id: string;
  page?: number;
  size?: number;
}

/** POST body. `id` ≤ 50 chars; `is_active` defaults to true when omitted. */
export interface AdminBeaconCreateInput {
  id: string;
  name: string;
  school_id: string;
  lane_id?: number | null;
  is_active?: boolean;
}

/**
 * PUT body. `name` + `is_active` are required; OMITTING `lane_id` unassigns
 * the beacon from its lane (send a number to (re)assign).
 */
export interface AdminBeaconUpdateInput {
  name: string;
  lane_id?: number | null;
  is_active: boolean;
}

export type AdminBeaconListResponse = ApiEnvelope<AdminBeacon[]>;
