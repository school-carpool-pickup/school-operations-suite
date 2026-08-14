import type { ApiEnvelope, Id } from './common';

/**
 * Wire shapes for `/api/v1/admin/lane-rules/*`, matching the backend
 * `lane_rule` module DTO (`RequestCreateLaneRule` / `RequestUpdateLaneRule`).
 *
 * Domain meaning: a "lane rule" decides which lane a family with multiple
 * children (whose grades map to *different* lanes) should be consolidated
 * to. `priority` is the selector strategy.
 *
 * Backend contract notes:
 * - the field is `priority`, NOT `priority_type`;
 * - `priority` only accepts `oldest_child` | `youngest_child`
 *   (`validate:"omitempty,oneof=..."`);
 * - `name` is `required` on BOTH create and update — a PUT without it fails
 *   validation with `40001 invalid data`.
 */

export type LaneRulePriorityType =
  | 'oldest_child' // siblings follow oldest child's grade-assigned lane
  | 'youngest_child'; // siblings follow youngest child's lane

export const LANE_RULE_PRIORITY_TYPES: LaneRulePriorityType[] = [
  'oldest_child',
  'youngest_child',
];

/** Narrow an unknown backend value to a priority we can render. */
export function isLaneRulePriorityType(
  value: unknown,
): value is LaneRulePriorityType {
  return LANE_RULE_PRIORITY_TYPES.includes(value as LaneRulePriorityType);
}

export interface AdminLaneRule {
  id: number;
  school_id: Id;
  /** Human-readable label. */
  name: string;
  /** Free-text description (backend `description`). */
  description?: string;
  /**
   * Selector strategy. Optional because the backend omits it when empty —
   * rules created before the FE sent the right field name have no priority.
   */
  priority?: LaneRulePriorityType;
  /** Only one active rule at a time per the product spec. */
  is_active: boolean;
  /** Anything else lives here so we don't lose data we don't yet model. */
  [extra: string]: unknown;
}

export type AdminLaneRuleListResponse = ApiEnvelope<AdminLaneRule[]>;

export interface AdminLaneRuleCreateInput {
  name: string;
  priority: LaneRulePriorityType;
  description?: string;
  is_active?: boolean;
}

/** `name` is required by the backend on update, so it's required here too. */
export interface AdminLaneRuleUpdateInput {
  name: string;
  priority?: LaneRulePriorityType;
  description?: string;
  is_active?: boolean;
}
