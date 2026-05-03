import { describe, expect, it } from 'vitest';
import { findFixture } from '@/mocks/fixtures';

describe('mocks/fixtures findFixture()', () => {
  it('matches an exact path', () => {
    const m = findFixture('GET', '/v1/students');
    expect(m).not.toBeNull();
    expect(m?.fixture.path).toBe('/v1/students');
  });

  it('captures a single dynamic segment', () => {
    const m = findFixture('GET', '/v1/students/s1');
    expect(m).not.toBeNull();
    expect(m?.params).toEqual({ id: 's1' });
  });

  it('captures multiple dynamic segments', () => {
    const m = findFixture('GET', '/v1/tv/schools/bis/gates/a/queue');
    expect(m).not.toBeNull();
    expect(m?.params).toEqual({ schoolId: 'bis', gateId: 'a' });
  });

  it('keeps static paths winning over dynamic siblings', () => {
    // /v1/students/stats (static) is registered before /v1/students/:id
    const m = findFixture('GET', '/v1/students/stats');
    expect(m?.fixture.path).toBe('/v1/students/stats');
  });

  it('returns null when nothing matches', () => {
    expect(findFixture('GET', '/v1/does-not-exist')).toBeNull();
    expect(findFixture('DELETE', '/v1/students')).toBeNull();
  });

  it('students list fixture returns the mock array', async () => {
    const m = findFixture('GET', '/v1/students');
    const result = await m?.fixture.handler({
      params: {},
      query: new URLSearchParams(),
      body: undefined,
    });
    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[]).length).toBeGreaterThan(0);
  });

  it('students stats fixture returns aggregated counts', async () => {
    const m = findFixture('GET', '/v1/students/stats');
    const result = (await m?.fixture.handler({
      params: {},
      query: new URLSearchParams(),
      body: undefined,
    })) as { total: number };
    expect(typeof result.total).toBe('number');
    expect(result.total).toBeGreaterThan(0);
  });
});
