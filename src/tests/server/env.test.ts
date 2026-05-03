import { describe, expect, it, vi } from 'vitest';

/**
 * env.ts validates and freezes config at module load. To test the routing
 * decisions in `shouldUseMock` we re-import the module under different
 * `process.env` snapshots — `vi.resetModules()` blows away the cache so
 * each call to `loadEnv` gets a fresh evaluation.
 */

async function loadEnv(envOverrides: Record<string, string | undefined>) {
  const before = { ...process.env };
  for (const key of Object.keys(envOverrides)) {
    if (envOverrides[key] === undefined) delete process.env[key];
    else process.env[key] = envOverrides[key];
  }
  vi.resetModules();
  try {
    const mod = await import('@/server/env');
    return mod;
  } finally {
    // Restore original env.
    for (const key of Object.keys(envOverrides)) {
      if (key in before) process.env[key] = before[key];
      else delete process.env[key];
    }
  }
}

describe('server/env shouldUseMock()', () => {
  it('defaults to mock when no env is set', async () => {
    const { shouldUseMock } = await loadEnv({
      BACKEND_API_URL: undefined,
      API_MODE: undefined,
      API_REAL_DOMAINS: undefined,
      API_MOCK_DOMAINS: undefined,
    });
    expect(shouldUseMock('students')).toBe(true);
  });

  it('returns mock when API_MODE=real but BACKEND_API_URL is empty', async () => {
    const { shouldUseMock } = await loadEnv({
      BACKEND_API_URL: '',
      API_MODE: 'real',
    });
    expect(shouldUseMock('students')).toBe(true);
  });

  it('returns real when API_MODE=real and BACKEND_API_URL is set', async () => {
    const { shouldUseMock } = await loadEnv({
      BACKEND_API_URL: 'https://api.example.com',
      API_MODE: 'real',
    });
    expect(shouldUseMock('students')).toBe(false);
  });

  it('API_REAL_DOMAINS takes precedence over API_MODE=mock', async () => {
    const { shouldUseMock } = await loadEnv({
      BACKEND_API_URL: 'https://api.example.com',
      API_MODE: 'mock',
      API_REAL_DOMAINS: 'students,staff',
    });
    expect(shouldUseMock('students')).toBe(false);
    expect(shouldUseMock('staff')).toBe(false);
    expect(shouldUseMock('beacons')).toBe(true);
  });

  it('API_MOCK_DOMAINS overrides API_MODE=real', async () => {
    const { shouldUseMock } = await loadEnv({
      BACKEND_API_URL: 'https://api.example.com',
      API_MODE: 'real',
      API_MOCK_DOMAINS: 'schools,gates',
    });
    expect(shouldUseMock('schools')).toBe(true);
    expect(shouldUseMock('gates')).toBe(true);
    expect(shouldUseMock('students')).toBe(false);
  });

  it('API_REAL_DOMAINS wins when a domain is in BOTH lists', async () => {
    const { shouldUseMock } = await loadEnv({
      BACKEND_API_URL: 'https://api.example.com',
      API_MODE: 'mock',
      API_REAL_DOMAINS: 'students',
      API_MOCK_DOMAINS: 'students',
    });
    expect(shouldUseMock('students')).toBe(false);
  });

  it('rejects invalid API_MODE at parse time', async () => {
    await expect(
      loadEnv({
        API_MODE: 'gibberish',
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid BACKEND_API_URL', async () => {
    await expect(
      loadEnv({
        BACKEND_API_URL: 'not-a-url',
      }),
    ).rejects.toThrow();
  });
});
