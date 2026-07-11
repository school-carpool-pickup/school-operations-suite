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

const schema = z.object({
  BACKEND_API_URL: z.union([z.string().url(), z.literal('')]).default(''),
  BACKEND_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  BACKEND_API_TOKEN: z.string().optional(),
});

export const env = schema.parse({
  BACKEND_API_URL: process.env.BACKEND_API_URL,
  BACKEND_API_TIMEOUT_MS: process.env.BACKEND_API_TIMEOUT_MS,
  BACKEND_API_TOKEN: process.env.BACKEND_API_TOKEN,
});

if (!env.BACKEND_API_URL) {
  // Every API call proxies to the backend — there is no mock fallback. Make a
  // missing upstream loud so it's obvious why calls come back 503.
  console.warn(
    '[env] BACKEND_API_URL is empty; all API calls will return 503.',
  );
}
