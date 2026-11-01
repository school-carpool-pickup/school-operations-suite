import type { AdminGrade, AdminLane, AdminPickup } from '@/types';

/** Grade name → lane id. Grades carry their lane; lanes don't list grades. */
export function gradeLaneMap(
  lanes: readonly AdminLane[],
  grades: readonly AdminGrade[],
): Map<string, number> {
  const laneIds = new Set(lanes.map((l) => l.id));
  const map = new Map<string, number>();
  for (const grade of grades) {
    if (grade.lane_id != null && laneIds.has(grade.lane_id)) {
      map.set(grade.name, grade.lane_id);
    }
  }
  return map;
}

/**
 * Whether a pickup belongs on one lane's board.
 *
 * The backend only records a pickup's lane (`lane_id`) when the car joins the
 * queue, but the staff at a gate need to see the cars still on their way too.
 * Until then the lane is predicted the way the backend will choose it: from
 * the children's grades, falling back to the school's first lane when no
 * grade is mapped. A family with children in two lanes shows on both until it
 * is queued — better than a car arriving at a gate whose board never showed
 * it. (That is also why the board filters here rather than sending `lane_id`
 * to the backend, which would drop every car not yet queued.)
 *
 * `gradeToLane` is null when the mapping can't be read (staff accounts may not
 * list grades); a car not yet queued then shows on every lane for the same
 * reason.
 */
export function isOnLane(
  pickup: Pick<AdminPickup, 'lane' | 'lane_id' | 'students'>,
  lane: AdminLane,
  lanes: readonly AdminLane[],
  gradeToLane: ReadonlyMap<string, number> | null,
): boolean {
  if (pickup.lane_id != null) return pickup.lane_id === lane.id;
  // Queued before the backend stored lane ids: only the lane's name is known.
  if (pickup.lane) return pickup.lane === lane.name;
  if (!gradeToLane) return true;
  const predicted = new Set(
    pickup.students
      .map((s) => gradeToLane.get(s.grade))
      .filter((id): id is number => id != null),
  );
  if (predicted.size === 0 && lanes[0]) predicted.add(lanes[0].id);
  return predicted.has(lane.id);
}
