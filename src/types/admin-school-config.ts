import type { ApiEnvelope, Id } from './common';

/**
 * Wire shapes for `/api/v1/admin/school-configs` (GET + PUT).
 *
 * The PUT body is the flat `AdminSchoolConfigData`; the backend derives
 * `school_id` from the admin's JWT, so it is NOT sent in the body. Both
 * GET and PUT respond with the nested `AdminSchoolConfig` shape. When a
 * school has no saved config yet the backend returns defaults (geofence
 * 500m, ble_beacon 15m). See
 * `backend-service/internal/shared/domain/school_config.go`.
 */

export interface AdminSchoolConfigData {
  /** Geofence radius in metres — pre-queue trigger distance. */
  geofence: number;
  /** BLE beacon range/threshold in metres — gate queue trigger. */
  ble_beacon: number;
  /** School centre latitude — origin of the geofence radius. */
  latitude: number;
  /** School centre longitude — origin of the geofence radius. */
  longitude: number;
}

export interface AdminSchoolConfig {
  school_id: Id;
  config: AdminSchoolConfigData;
}

export type AdminSchoolConfigResponse = ApiEnvelope<AdminSchoolConfig>;

/** PUT body — flat config; `school_id` is derived from the JWT, not sent. */
export type AdminSchoolConfigUpdateInput = AdminSchoolConfigData;
