import { describe, expect, it } from 'vitest';
import { findFixture } from '@/mocks/fixtures';
import type { AdminPickup, ApiEnvelope } from '@/types';

describe('mocks/fixtures findFixture()', () => {
  it('matches an exact path', () => {
    const m = findFixture('GET', '/v1/admin/grades');
    expect(m).not.toBeNull();
    expect(m?.fixture.path).toBe('/v1/admin/grades');
  });

  it('captures a single dynamic segment', () => {
    const m = findFixture('GET', '/v1/admin/grades/7');
    expect(m).not.toBeNull();
    expect(m?.params).toEqual({ id: '7' });
  });

  it('captures a dynamic segment with a static suffix', () => {
    const m = findFixture('POST', '/v1/admin/pickup/abc123/complete');
    expect(m).not.toBeNull();
    expect(m?.fixture.path).toBe('/v1/admin/pickup/:id/complete');
    expect(m?.params).toEqual({ id: 'abc123' });
  });

  it('disambiguates a static list from its dynamic byId sibling', () => {
    const list = findFixture('GET', '/v1/admin/grades');
    expect(list?.fixture.path).toBe('/v1/admin/grades');
    const byId = findFixture('GET', '/v1/admin/grades/7');
    expect(byId?.fixture.path).toBe('/v1/admin/grades/:id');
  });

  it('returns null when nothing matches', () => {
    expect(findFixture('GET', '/v1/does-not-exist')).toBeNull();
    expect(findFixture('DELETE', '/v1/admin/grades')).toBeNull();
  });

  it('admin pickup fixture returns enveloped, paginated rows', async () => {
    const m = findFixture('GET', '/v1/admin/pickup');
    const result = (await m?.fixture.handler({
      params: {},
      query: new URLSearchParams('size=2'),
      body: undefined,
    })) as ApiEnvelope<AdminPickup[]>;
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeLessThanOrEqual(2);
    expect(result.total).toBeGreaterThan(0);
    expect(result.data[0]?.stage_label).toBeTruthy();
    expect(result.data[0]?.family.family_name).toBeTruthy();
  });
});
