import type { ApiEnvelope, Id } from './common';

/**
 * Wire shapes for `/api/v1/admin/lane-rules/*`.
 *
 * NOTE: backend module not yet implemented (no `internal/modules/lane_rule/`
 * directory at audit time) — the concrete fields below are frontend-defined
 * placeholders so the Override Rules UI can render and exercise the proxy
 * /mock layer. Tighten when the backend module ships and confirms the
 * canonical schema.
 *
 * Domain meaning: a "lane rule" decides which lane a family with multiple
 * children (whose grades map to *different* lanes) should be consolidated
 * to. `priority_type` is the selector strategy.
 */

export type LaneRulePriorityType =
  | 'oldest_child' // siblings follow oldest child's grade-assigned lane
  | 'youngest_child' // siblings follow youngest child's lane
  | 'lowest_lane_code'; // alphanumerically lowest lane code wins

export interface AdminLaneRule {
  id: number;
  school_id: Id;
  /** Human-readable label. */
  name: string;
  /** Selector strategy — see `LaneRulePriorityType`. */
  priority_type: LaneRulePriorityType;
  /** Only one active rule at a time per the product spec. */
  is_active: boolean;
  /** Anything else lives here so we don't lose data we don't yet model. */
  [extra: string]: unknown;
}

export type AdminLaneRuleListResponse = ApiEnvelope<AdminLaneRule[]>;

export interface AdminLaneRuleCreateInput {
  name: string;
  priority_type: LaneRulePriorityType;
  is_active?: boolean;
}

export interface AdminLaneRuleUpdateInput {
  name?: string;
  priority_type?: LaneRulePriorityType;
  is_active?: boolean;
}
