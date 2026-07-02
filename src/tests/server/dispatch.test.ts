import { describe, expect, it } from 'vitest';
import { findFixture } from '@/mocks/fixtures';
import type { AdminPickup, AnalyticsSummary, ApiEnvelope } from '@/types';

describe('mocks/fixtures findFixture()', () => {
  it('matches an exact path', () => {
    const m = findFixture('GET', '/v1/transactions');
    expect(m).not.toBeNull();
    expect(m?.fixture.path).toBe('/v1/transactions');
  });

  it('captures a single dynamic segment', () => {
    const m = findFixture('GET', '/v1/transactions/tx1');
    expect(m).not.toBeNull();
    expect(m?.params).toEqual({ id: 'tx1' });
  });

  it('captures multiple dynamic segments', () => {
    const m = findFixture('GET', '/v1/tv/schools/bis/gates/a/queue');
    expect(m).not.toBeNull();
    expect(m?.params).toEqual({ schoolId: 'bis', gateId: 'a' });
  });

  it('disambiguates a static list from its dynamic byId sibling', () => {
    const list = findFixture('GET', '/v1/admin/grades');
    expect(list?.fixture.path).toBe('/v1/admin/grades');
    const byId = findFixture('GET', '/v1/admin/grades/7');
    expect(byId?.fixture.path).toBe('/v1/admin/grades/:id');
    expect(byId?.params).toEqual({ id: '7' });
  });

  it('returns null when nothing matches', () => {
    expect(findFixture('GET', '/v1/does-not-exist')).toBeNull();
    expect(findFixture('DELETE', '/v1/transactions')).toBeNull();
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

  it('analytics summary fixture aggregates from the mock DB', async () => {
    const m = findFixture('GET', '/v1/analytics/summary');
    const result = (await m?.fixture.handler({
      params: {},
      query: new URLSearchParams(),
      body: undefined,
    })) as ApiEnvelope<AnalyticsSummary>;
    expect(typeof result.data.total_revenue).toBe('number');
    expect(result.data.total_revenue).toBeGreaterThan(0);
    expect(result.data.total_schools).toBeGreaterThan(0);
  });
});
