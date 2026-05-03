/**
 * Central enum registry. Use `as const` + union types instead of TS `enum`
 * — they erase at runtime, work with JSON, and play nicely with strict TS.
 *
 * Pattern:
 *   export const PickupStatus = { Queued: 'Queued', ... } as const;
 *   export type PickupStatus = (typeof PickupStatus)[keyof typeof PickupStatus];
 */

// Platform-level user role (who can log into which portal)
export const UserRole = {
  Admin: 'admin',
  Staff: 'staff',
  Business: 'business',
  Tv: 'tv',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// School-side staff role (shown in Admin > Staff CRM)
export const SchoolStaffRole = {
  Administrator: 'Administrator',
  Staff: 'Staff',
} as const;
export type SchoolStaffRole =
  (typeof SchoolStaffRole)[keyof typeof SchoolStaffRole];

export const StaffStatus = {
  Active: 'active',
  Suspended: 'suspended',
} as const;
export type StaffStatus = (typeof StaffStatus)[keyof typeof StaffStatus];

export const FamilyStatus = {
  Active: 'active',
  Banned: 'banned',
} as const;
export type FamilyStatus = (typeof FamilyStatus)[keyof typeof FamilyStatus];

export const StudentEnrollmentStatus = {
  Enrolled: 'enrolled',
  Withdrawn: 'withdrawn',
  Inactive: 'inactive',
} as const;
export type StudentEnrollmentStatus =
  (typeof StudentEnrollmentStatus)[keyof typeof StudentEnrollmentStatus];

// Per-student status shown on the daily board
export const StudentPickupStatus = {
  InClass: 'In Class',
  ReadyForPickup: 'Ready for Pickup',
  PickedUp: 'Picked Up',
} as const;
export type StudentPickupStatus =
  (typeof StudentPickupStatus)[keyof typeof StudentPickupStatus];

// Pickup record status (CRM view)
export const PickupStatus = {
  Pending: 'Pending',
  Queued: 'Queued',
  Ready: 'Ready',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  NoShow: 'No Show',
} as const;
export type PickupStatus = (typeof PickupStatus)[keyof typeof PickupStatus];

// Live gate-queue status (TV display, ALL_CAPS by intent — TV uses badges)
export const GateQueueStatus = {
  InQueue: 'IN_QUEUE',
  Preparing: 'PREPARING',
  Called: 'CALLED',
  Completed: 'COMPLETED',
} as const;
export type GateQueueStatus =
  (typeof GateQueueStatus)[keyof typeof GateQueueStatus];

export const GateQueueType = {
  Standard: 'STANDARD',
  Carpool: 'CARPOOL',
  Taxi: 'TAXI',
} as const;
export type GateQueueType = (typeof GateQueueType)[keyof typeof GateQueueType];

export const BeaconStatus = {
  Online: 'online',
  Offline: 'offline',
} as const;
export type BeaconStatus = (typeof BeaconStatus)[keyof typeof BeaconStatus];

export const TransactionStatus = {
  Pending: 'pending',
  Completed: 'completed',
  Failed: 'failed',
  Refunded: 'refunded',
} as const;
export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const NotificationSeverity = {
  Info: 'info',
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
} as const;
export type NotificationSeverity =
  (typeof NotificationSeverity)[keyof typeof NotificationSeverity];
