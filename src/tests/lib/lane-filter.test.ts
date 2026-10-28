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

const pickup = (lane: string | undefined, grades: string[]) => ({
  lane,
  students: grades.map((grade, i) => ({
    id: `s${i}`,
    first_name: 'A',
    last_name: 'B',
    grade,
    section: '',
  })),
});

describe('isOnLane', () => {
  it('uses the lane the backend assigned once the car is queued', () => {
    expect(isOnLane(pickup('D3', ['K1']), 'D3', LANES, MAP)).toBe(true);
    // The assignment wins over the grade prediction.
    expect(isOnLane(pickup('D3', ['K1']), 'D2', LANES, MAP)).toBe(false);
  });

  it("predicts an unqueued car's lane from the child's grade", () => {
    expect(isOnLane(pickup(undefined, ['P6']), 'D4', LANES, MAP)).toBe(true);
    expect(isOnLane(pickup(undefined, ['P6']), 'D2', LANES, MAP)).toBe(false);
  });

  it('shows a family with children in two lanes on both until it is queued', () => {
    const p = pickup(undefined, ['K2', 'P1']);
    expect(isOnLane(p, 'D2', LANES, MAP)).toBe(true);
    expect(isOnLane(p, 'D3', LANES, MAP)).toBe(true);
    expect(isOnLane(p, 'D4', LANES, MAP)).toBe(false);
  });

  it("falls back to the school's first lane when no grade is mapped, like the backend", () => {
    const p = pickup(undefined, ['Unassigned']);
    expect(isOnLane(p, 'D2', LANES, MAP)).toBe(true);
    expect(isOnLane(p, 'D3', LANES, MAP)).toBe(false);
  });

  it('shows an unqueued car on every lane when the grade mapping is unknown', () => {
    expect(isOnLane(pickup(undefined, ['P6']), 'D2', LANES, null)).toBe(true);
    // A queued car is still placed exactly.
    expect(isOnLane(pickup('D4', ['P6']), 'D2', LANES, null)).toBe(false);
  });
});
