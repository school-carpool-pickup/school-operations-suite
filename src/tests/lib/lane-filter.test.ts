import { describe, expect, it } from 'vitest';
import { gradeLaneMap, isOnLane } from '@/lib/pickup/lane-filter';
import type { AdminGrade, AdminLane } from '@/types';

const LANES: AdminLane[] = [
  { id: 1, school_id: 's', name: 'D2', code: 'D2' },
  { id: 2, school_id: 's', name: 'D3', code: 'D3' },
  { id: 3, school_id: 's', name: 'D4', code: 'D4' },
];
const grade = (
  id: number,
  name: string,
  lane_id: number | null,
): AdminGrade => ({
  id,
  school_id: 's',
  name,
  lane_id,
});
const MAP = gradeLaneMap(LANES, [
  grade(1, 'K1', 1),
  grade(2, 'K2', 1),
  grade(3, 'P1', 2),
  grade(4, 'P6', 3),
  grade(5, 'Unassigned', null),
]);

const [D2, D3, D4] = LANES;

const pickup = (
  lane: { lane?: string; lane_id?: number },
  grades: string[],
) => ({
  ...lane,
  students: grades.map((grade, i) => ({
    id: `s${i}`,
    first_name: 'A',
    last_name: 'B',
    grade,
    section: '',
  })),
});
const queued = (l: AdminLane) => ({ lane: l.name, lane_id: l.id });
const unqueued = {};

describe('isOnLane', () => {
  it('uses the lane the backend assigned once the car is queued', () => {
    expect(isOnLane(pickup(queued(D3), ['K1']), D3, LANES, MAP)).toBe(true);
    // The assignment wins over the grade prediction.
    expect(isOnLane(pickup(queued(D3), ['K1']), D2, LANES, MAP)).toBe(false);
  });

  it('matches on the lane id, so renaming a lane keeps its cars', () => {
    const p = pickup({ lane: 'Old D3 name', lane_id: D3.id }, ['K1']);
    expect(isOnLane(p, D3, LANES, MAP)).toBe(true);
    expect(isOnLane(p, D2, LANES, MAP)).toBe(false);
  });

  it('falls back to the lane name on pickups queued before lane ids existed', () => {
    expect(isOnLane(pickup({ lane: 'D4' }, ['K1']), D4, LANES, MAP)).toBe(true);
    expect(isOnLane(pickup({ lane: 'D4' }, ['K1']), D2, LANES, MAP)).toBe(
      false,
    );
  });

  it("predicts an unqueued car's lane from the child's grade", () => {
    expect(isOnLane(pickup(unqueued, ['P6']), D4, LANES, MAP)).toBe(true);
    expect(isOnLane(pickup(unqueued, ['P6']), D2, LANES, MAP)).toBe(false);
  });

  it('shows a family with children in two lanes on both until it is queued', () => {
    const p = pickup(unqueued, ['K2', 'P1']);
    expect(isOnLane(p, D2, LANES, MAP)).toBe(true);
    expect(isOnLane(p, D3, LANES, MAP)).toBe(true);
    expect(isOnLane(p, D4, LANES, MAP)).toBe(false);
  });

  it("falls back to the school's first lane when no grade is mapped, like the backend", () => {
    const p = pickup(unqueued, ['Unassigned']);
    expect(isOnLane(p, D2, LANES, MAP)).toBe(true);
    expect(isOnLane(p, D3, LANES, MAP)).toBe(false);
  });

  it('shows an unqueued car on every lane when the grade mapping is unknown', () => {
    expect(isOnLane(pickup(unqueued, ['P6']), D2, LANES, null)).toBe(true);
    // A queued car is still placed exactly.
    expect(isOnLane(pickup(queued(D4), ['P6']), D2, LANES, null)).toBe(false);
  });
});
