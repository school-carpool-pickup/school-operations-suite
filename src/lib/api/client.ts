import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '@/hooks/use-auth-store';

/**
 * Single axios instance used by every client-side caller. Always goes through
 * `/api/...`, which is served by the dynamic catch-all route.
 *
 * Server components MUST NOT use this — they call dispatch directly via
 * `getApi` for speed and to avoid spinning up an HTTP request to localhost.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

/**
 * Request interceptor — inject the bearer token on every call. The catch-all
 * route forwards `Authorization` to the upstream backend verbatim.
 */
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor — if the upstream rejects the token (401/403) on any
 * authenticated endpoint, drop the local session AND bounce the user to
 * `/login?redirect=<current path>` so they can re-authenticate and land
 * back where they were. The login/register endpoints are exempt: a 401 on
 * those means "wrong creds", not "expired session".
 *
 * The redirect is a full `window.location` navigation (not router.push)
 * because this interceptor lives outside React — no router context here,
 * and a hard reload also flushes any in-flight client state cleanly.
 */
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    const isAuthEndpoint =
      url.includes('/auth/login') || url.includes('/auth/register');

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      useAuthStore.getState().clearSession();

      // SSR guard + loop guard. Don't redirect server-side (no window),
      // and don't redirect when already at /login (would just loop).
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        const next = window.location.pathname + window.location.search;
        // `reason` is read by the login page to show a "your session
        // expired" toast — URL-driven so the message survives the full
        // page navigation here.
        const params = new URLSearchParams({
          redirect: next,
          reason: 'session_expired',
        });
        window.location.href = `/login?${params.toString()}`;
      }
    }
    return Promise.reject(error);
  },
);
