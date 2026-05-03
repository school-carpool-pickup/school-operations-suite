/**
 * Common, domain-agnostic types reused across the app.
 * Domain types live in their own files (student.ts, pickup.ts, ...).
 */

export type Id = string;
export type ISODate = string;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Envelope shape every backend response uses, including non-list endpoints.
 * Pagination fields stay zero for single-resource responses; check
 * `error.code` to distinguish success from failure inside a 2xx body.
 *
 *   { data: { ... }, error: { code: '', message: '' }, page: 0, size: 0, ... }
 */
export interface ApiEnvelope<T = unknown> {
  data: T;
  error: ApiEnvelopeError;
  page: number;
  size: number;
  total: number;
  totalPage: number;
  warning: string;
}

export interface ApiEnvelopeError {
  code: string;
  message: string;
}

/** Empty error object — used by mock fixtures returning success envelopes. */
export const EMPTY_ENVELOPE_ERROR: ApiEnvelopeError = { code: '', message: '' };

/** Wrap a success payload in the standard envelope shape. */
export function envelope<T>(data: T): ApiEnvelope<T> {
  return {
    data,
    error: EMPTY_ENVELOPE_ERROR,
    page: 0,
    size: 0,
    total: 0,
    totalPage: 0,
    warning: '',
  };
}

export type Nullable<T> = T | null;
