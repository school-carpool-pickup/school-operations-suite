import 'server-only';
import { dispatch } from '@/server/dispatch';
import type { ApiKey } from './keys';

/**
 * Server-side fetch. Used in server components.
 *
 * Goes through the same `dispatch()` the catch-all route uses — so server
 * components see the SAME response (mock or upstream) as the client would.
 * No HTTP round-trip; we run dispatch in-process.
 *
 *   const students = await getApi<Student[]>(apiKeys.students.list());
 */
export async function getApi<T = unknown>(key: ApiKey): Promise<T> {
  const query = new URLSearchParams();
  if (key.query) {
    for (const [k, v] of Object.entries(key.query)) {
      if (v !== undefined) query.set(k, String(v));
    }
  }

  const result = await dispatch<T>({
    method: key.method ?? 'GET',
    path: key.path,
    query,
    body: key.body,
  });

  if (result.status >= 400) {
    const data = result.data as { error?: string } | undefined;
    throw new Error(
      `API ${key.method ?? 'GET'} ${key.path} → ${result.status}: ${data?.error ?? 'request failed'}`,
    );
  }

  return result.data;
}
