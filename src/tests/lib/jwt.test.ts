import { describe, expect, it } from 'vitest';
import { decodeJwtPayload, isTokenExpired } from '@/lib/auth/jwt';

/**
 * Build a fake JWT (header.payload.signature). The signature is a sham —
 * we never verify it client-side, that's the backend's job.
 */
function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const body = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${body}.signature`;
}

describe('lib/auth/jwt', () => {
  it('decodes a well-formed payload', () => {
    const token = makeJwt({ sub: 'u1', exp: 1700000000 });
    expect(decodeJwtPayload(token)).toEqual({ sub: 'u1', exp: 1700000000 });
  });

  it('returns null for malformed tokens', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(decodeJwtPayload('only.two')).toBeNull();
    expect(decodeJwtPayload('')).toBeNull();
  });

  it('flags an expired token', () => {
    const expired = makeJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(isTokenExpired(expired)).toBe(true);
  });

  it('passes a token that expires in the future', () => {
    const fresh = makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isTokenExpired(fresh)).toBe(false);
  });

  it('treats a token without `exp` as not-expired (we trust until proven bad)', () => {
    const token = makeJwt({ sub: 'u1' });
    expect(isTokenExpired(token)).toBe(false);
  });

  it('respects the skew window (token expiring within skew counts as expired)', () => {
    const inFifteenSec = makeJwt({ exp: Math.floor(Date.now() / 1000) + 15 });
    // Default skew is 30s, so 15s-from-now is "already expired".
    expect(isTokenExpired(inFifteenSec)).toBe(true);
    // With a tighter 5s skew it's still good.
    expect(isTokenExpired(inFifteenSec, 5)).toBe(false);
  });
});
