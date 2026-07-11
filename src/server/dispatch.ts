import 'server-only';
import axios from 'axios';
import { env } from './env';
import { upstream } from './upstream';

/**
 * Single entry point for every API call.
 *
 *   /api/v1/auth/me  →  dispatch(GET, '/v1/auth/me')
 *
 * Forwards method/path/query/body/headers verbatim to
 * `BACKEND_API_URL + /api + path`. There is no per-endpoint code and no mock
 * layer: if the backend doesn't serve a path it returns 404/501 and the
 * calling page renders its empty / not-connected state.
 *
 * Used by both the catch-all route (HTTP entry) and `getApi` (server
 * components, in-process).
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface DispatchInput {
  method: HttpMethod;
  /** Path with leading slash, e.g. `/v1/auth/me`. The `/api` prefix is added by the proxy. */
  path: string;
  query?: URLSearchParams;
  body?: unknown;
  /** Forwarded to upstream (Cookie, Authorization, etc). Internal/hop-by-hop headers are stripped. */
  headers?: Headers;
}

export interface DispatchResult<T = unknown> {
  status: number;
  data: T;
}

const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'upgrade',
]);

export async function dispatch<T = unknown>(
  input: DispatchInput,
): Promise<DispatchResult<T>> {
  if (!env.BACKEND_API_URL) {
    return {
      status: 503,
      data: {
        error: 'BACKEND_API_URL not configured — cannot proxy.',
      } as T,
    };
  }

  const headers = filterHeaders(input.headers);
  const url = `/api${input.path}`; // upstream URL = BACKEND_API_URL + /api + path

  try {
    const res = await upstream.request<T>({
      method: input.method,
      url,
      params: input.query
        ? Object.fromEntries(input.query.entries())
        : undefined,
      data: input.body,
      headers,
      // Treat all 2xx-5xx as resolved so we can forward upstream's status.
      validateStatus: () => true,
    });
    return { status: res.status, data: res.data };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Network error / timeout — upstream isn't reachable.
      console.error(
        `[dispatch] ${input.method} ${url} → ${error.code ?? 'error'}`,
        error.message,
      );
      return {
        status: 502,
        data: {
          error: `Upstream unreachable: ${error.message}`,
          code: error.code,
        } as T,
      };
    }
    throw error;
  }
}

function filterHeaders(input?: Headers): Record<string, string> | undefined {
  if (!input) return undefined;
  const out: Record<string, string> = {};
  input.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    out[key] = value;
  });
  return out;
}
