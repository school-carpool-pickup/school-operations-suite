import type { AdminGrade, AdminLane, AdminPickup } from '@/types';

/** Grade name → lane name. Grades carry their lane; lanes don't list grades. */
export function gradeLaneMap(
  lanes: readonly AdminLane[],
  grades: readonly AdminGrade[],
): Map<string, string> {
  const laneName = new Map(lanes.map((l) => [l.id, l.name]));
  const map = new Map<string, string>();
  for (const grade of grades) {
    const name =
      grade.lane_id == null ? undefined : laneName.get(grade.lane_id);
    if (name) map.set(grade.name, name);
  }
  return map;
}

/**
 * Whether a pickup belongs on one lane's board.
 *
 * The backend only records a pickup's lane when the car joins the queue, but
 * the staff at a gate need to see the cars still on their way too. Until then
 * the lane is predicted the way the backend will choose it: from the
 * children's grades, falling back to the school's first lane when no grade is
 * mapped. A family with children in two lanes shows on both until it is
 * queued — better than a car arriving at a gate whose board never showed it.
 *
 * `gradeToLane` is null when the mapping can't be read (staff accounts may not
 * list grades); a car not yet queued then shows on every lane for the same
 * reason.
 */
export function isOnLane(
  pickup: Pick<AdminPickup, 'lane' | 'students'>,
  laneName: string,
  lanes: readonly AdminLane[],
  gradeToLane: ReadonlyMap<string, string> | null,
): boolean {
  if (pickup.lane) return pickup.lane === laneName;
  if (!gradeToLane) return true;
  const predicted = new Set(
    pickup.students
      .map((s) => gradeToLane.get(s.grade))
      .filter((name): name is string => !!name),
  );
  if (predicted.size === 0 && lanes[0]) predicted.add(lanes[0].name);
  return predicted.has(laneName);
}
