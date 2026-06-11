import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from '@/hooks/use-auth-store';
import { isTokenExpired } from '@/lib/auth/jwt';

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
 * Response interceptor — on a 401/403 from an authenticated endpoint, drop
 * the local session and bounce to `/login?redirect=<current path>` **only
 * when the access token has actually expired locally**. The backend returns
 * 401 with the same `40102` code for both "token expired" and "role
 * mismatch on a still-valid token", so we disambiguate using the local
 * `expiresAt` / JWT `exp` — otherwise a 403 from a portal the user lacks
 * access to would nuke their session. Login/register/validate endpoints
 * are exempt from any redirect.
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
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      // RBAC hydration must never force a logout. A genuinely expired token is
      // still caught by the local `exp` check in AuthBootstrap.
      url.includes('/auth/validate');

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      const { accessToken, expiresAt } = useAuthStore.getState();
      // Only clear+redirect when the session is genuinely dead. A
      // still-valid token getting 401/403 means "role mismatch" or
      // "transient failure" — leave the user signed in so the page can
      // render its own error state instead of losing their work.
      const sessionDead =
        !accessToken ||
        (expiresAt != null && expiresAt <= Date.now()) ||
        isTokenExpired(accessToken);

      if (sessionDead) {
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
    }
    return Promise.reject(error);
  },
);
