import 'server-only';
import { z } from 'zod';

/**
 * Server-only env config. Validated with zod at module load — boot fails
 * loudly if `.env` is wrong rather than silently producing weird behaviour
 * later. See `.env.example` for the full list.
 *
 * Never import this from a client component. The `server-only` import above
 * makes such an import fail at build time.
 */

const csv = (raw: string | undefined): string[] =>
  (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const schema = z.object({
  BACKEND_API_URL: z.union([z.string().url(), z.literal('')]).default(''),
  BACKEND_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  BACKEND_API_TOKEN: z.string().optional(),
  API_MODE: z.enum(['mock', 'real']).default('mock'),
  API_MOCK_DOMAINS: z.string().default(''),
  API_REAL_DOMAINS: z.string().default(''),
});

const parsed = schema.parse({
  BACKEND_API_URL: process.env.BACKEND_API_URL,
  BACKEND_API_TIMEOUT_MS: process.env.BACKEND_API_TIMEOUT_MS,
  BACKEND_API_TOKEN: process.env.BACKEND_API_TOKEN,
  API_MODE: process.env.API_MODE,
  API_MOCK_DOMAINS: process.env.API_MOCK_DOMAINS,
  API_REAL_DOMAINS: process.env.API_REAL_DOMAINS,
});

export const env = {
  ...parsed,
  /** Parsed comma-separated lists — handy for membership tests. */
  apiMockDomains: csv(parsed.API_MOCK_DOMAINS),
  apiRealDomains: csv(parsed.API_REAL_DOMAINS),
} as const;

/**
 * Decides whether a given domain handler should serve from the in-memory
 * mock or proxy to the real backend.
 *
 * Precedence (highest first):
 *   1. `API_REAL_DOMAINS` includes the domain → real
 *   2. `API_MOCK_DOMAINS` includes the domain → mock
 *   3. `BACKEND_API_URL` empty → mock (no upstream configured)
 *   4. `API_MODE` value
 */
export function shouldUseMock(domain: string): boolean {
  if (env.apiRealDomains.includes(domain)) return false;
  if (env.apiMockDomains.includes(domain)) return true;
  if (!env.BACKEND_API_URL) return true;
  return env.API_MODE === 'mock';
}

if (env.API_MODE === 'real' && !env.BACKEND_API_URL) {
  // Don't crash — degrade gracefully — but make it loud.
  console.warn(
    '[env] API_MODE=real but BACKEND_API_URL is empty; falling back to mock.',
  );
}
