import 'server-only';
import axios, { type AxiosInstance } from 'axios';
import { env } from './env';

/**
 * Server-side axios instance for talking to the real backend.
 *
 * Used only when `mockable()` decides to proxy a request (see `_mockable.ts`).
 * Bearer token is wired in if `BACKEND_API_TOKEN` is present.
 */
export const upstream: AxiosInstance = axios.create({
  baseURL: env.BACKEND_API_URL || undefined,
  timeout: env.BACKEND_API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    ...(env.BACKEND_API_TOKEN
      ? { Authorization: `Bearer ${env.BACKEND_API_TOKEN}` }
      : {}),
  },
});
