import 'server-only';
import axios from 'axios';
import { FixtureNotFoundError, findFixture } from '@/mocks/fixtures';
import { env, shouldUseMock } from './env';
import { upstream } from './upstream';

/**
 * Single decision point for every API call.
 *
 *   /api/v1/auth/me  →  dispatch(GET, '/v1/auth/me')
 *
 * In mock mode: looks up `src/mocks/fixtures.ts`, runs the handler.
 * In real mode: forwards method/path/query/body/headers verbatim to
 * `BACKEND_API_URL + path`.
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
  const domain = inferDomain(input.path);

  if (shouldUseMock(domain)) {
    return runMock<T>(input);
  }

  return runUpstream<T>(input);
}

async function runMock<T>(input: DispatchInput): Promise<DispatchResult<T>> {
  const matched = findFixture(input.method, input.path);
  if (!matched) {
    return {
      status: 501,
      data: {
        error: `No mock fixture for ${input.method} ${input.path}`,
        hint: 'Add an entry to src/mocks/fixtures.ts, or flip this domain to real via API_REAL_DOMAINS.',
      } as T,
    };
  }

  try {
    const data = await matched.fixture.handler({
      params: matched.params,
      query: input.query ?? new URLSearchParams(),
      body: input.body,
    });
    return { status: 200, data: data as T };
  } catch (error: unknown) {
    if (error instanceof FixtureNotFoundError) {
      return { status: 404, data: { error: error.message } as T };
    }
    const message =
      error instanceof Error ? error.message : 'Mock handler failed';
    console.error(`[dispatch:mock] ${input.method} ${input.path} →`, error);
    return { status: 500, data: { error: message } as T };
  }
}

async function runUpstream<T>(
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
        `[dispatch:upstream] ${input.method} ${url} → ${error.code ?? 'error'}`,
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

/**
 * Domain key used by `shouldUseMock`. Examples:
 *   /v1/auth/me                 → 'auth'
 *   /v1/students/s1             → 'students'
 *   /v1/tv/schools/.../queue    → 'tv'
 *   /v1/admin/families          → 'admin/families'
 *   /v1/admin/students/s1       → 'admin/students'
 *
 * `admin` is special-cased: backend admin endpoints fan out per resource
 * (families, students, vehicles, ...), and we want to flip them
 * mock↔real one resource at a time. So the domain combines the next
 * segment for `admin/*` paths.
 */
function inferDomain(path: string): string {
  const segments = splitPath(path).filter((s) => !/^v\d+$/i.test(s));
  if (segments[0] === 'admin' && segments[1]) {
    return `admin/${segments[1]}`;
  }
  return segments[0] ?? '';
}

function splitPath(p: string): string[] {
  return p.split('/').filter(Boolean);
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
