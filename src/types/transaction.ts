import type { ApiEnvelope, Id, ISODate } from './common';
import type { TransactionStatus } from './enums';

/**
 * Wire shapes for the PROPOSED Transaction + Analytics backend modules
 * (KAN-18). Neither exists on any backend branch yet (checked origin/dev
 * 2026-07-02); per the ticket the backend will implement them to match the
 * suite's fixtures, so these types + `src/mocks/fixtures.ts` ARE the
 * proposed contract:
 *
 *   GET /api/v1/transactions?page&size&search&status → ApiEnvelope<Transaction[]>
 *   GET /api/v1/transactions/:id                     → ApiEnvelope<Transaction>
 *   GET /api/v1/analytics/summary                    → ApiEnvelope<AnalyticsSummary>
 *
 * Conventions mirrored from existing backend modules: snake_case JSON,
 * `domain.Response` envelope, list pagination via page/size/total/totalPage
 * (see the AdminSchool list). When the backend ships, flip via
 * `API_REAL_DOMAINS=transactions,analytics` — pages don't change.
 */
export interface Transaction {
  id: Id;
  /** THB. */
  amount: number;
  date: ISODate;
  status: TransactionStatus | string;
  description: string;
}

export interface TransactionListParams {
  page?: number;
  size?: number;
  /** Matches against `description`, case-insensitive. */
  search?: string;
  status?: TransactionStatus;
}

export type TransactionListResponse = ApiEnvelope<Transaction[]>;

/** Platform-wide numbers for the business dashboard + payments cards. */
export interface AnalyticsSummary {
  /** THB, sum of completed transactions. */
  total_revenue: number;
  pending_transactions: number;
  total_schools: number;
  total_users: number;
  total_pickups: number;
  active_beacons: number;
  total_beacons: number;
}

export type AnalyticsSummaryResponse = ApiEnvelope<AnalyticsSummary>;
