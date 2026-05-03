/**
 * Tiny JWT helpers — payload-only decode, no signature verification (that's
 * the backend's job). We only use these to read `exp` for client-side
 * expiry checks so we can pre-empt a 401 round-trip.
 *
 * Pure browser primitives — no library required.
 */

export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  aud?: string | string[];
  iss?: string;
  [claim: string]: unknown;
}

/**
 * Base64-URL decode a JWT payload. Returns null on any malformed input.
 * Works in both browser (atob) and Node test envs (Buffer fallback).
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Pad to length-mod-4.
    while (b64.length % 4) b64 += '=';

    const decoded =
      typeof atob === 'function'
        ? atob(b64)
        : Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * `true` if the token's `exp` claim is in the past (with `skewSeconds`
 * leeway to absorb clock drift between client and server).
 *
 * Returns `false` if the token is unparseable OR has no `exp` — we'd rather
 * trust an unknown token than aggressively log the user out.
 */
export function isTokenExpired(token: string, skewSeconds = 30): boolean {
  const p = decodeJwtPayload(token);
  if (!p?.exp) return false;
  return p.exp * 1000 < Date.now() + skewSeconds * 1000;
}
