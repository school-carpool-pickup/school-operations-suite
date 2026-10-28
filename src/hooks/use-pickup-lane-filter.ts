'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiKeys, useApi } from '@/lib/api';
import { gradeLaneMap, isOnLane } from '@/lib/pickup/lane-filter';
import type {
  AdminGradeListResponse,
  AdminLane,
  AdminLaneListResponse,
  AdminPickup,
} from '@/types';

const NO_LANES: readonly AdminLane[] = [];

/**
 * Narrows a pickup board to one gate's lane — a teacher at D2 only wants the
 * cars coming to D2. The choice is remembered on this browser, so the screen
 * at each gate stays on its lane between days.
 *
 * `canReadGrades`: staff accounts can't list grades, so without them a car
 * not yet queued can't be placed and shows on every lane (see `isOnLane`).
 */
export function usePickupLaneFilter(
  storageKey: string,
  pickups: readonly AdminPickup[],
  { canReadGrades }: { canReadGrades: boolean },
) {
  const lanesQuery = useApi<AdminLaneListResponse>(apiKeys.adminLanes.list(), {
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const lanes = lanesQuery.data?.data ?? NO_LANES;
  const gradesQuery = useApi<AdminGradeListResponse>(
    apiKeys.adminGrades.list(),
    { enabled: canReadGrades, staleTime: 5 * 60 * 1000, retry: false },
  );
  const grades = gradesQuery.data?.data;

  const [stored, setStored] = useState('');
  useEffect(() => {
    try {
      setStored(localStorage.getItem(storageKey) ?? '');
    } catch {
      // Storage blocked (private window etc.) — just start on all lanes.
    }
  }, [storageKey]);

  const setLane = (next: string) => {
    setStored(next);
    try {
      if (next) localStorage.setItem(storageKey, next);
      else localStorage.removeItem(storageKey);
    } catch {
      // Not remembered this time; the filter still applies.
    }
  };

  // A remembered lane that has since been renamed or removed means "all".
  const lane = lanes.some((l) => l.name === stored) ? stored : '';
  const gradeToLane = useMemo(
    () => (grades ? gradeLaneMap(lanes, grades) : null),
    [lanes, grades],
  );
  const visible = useMemo(
    () =>
      lane
        ? pickups.filter((p) => isOnLane(p, lane, lanes, gradeToLane))
        : pickups,
    [lane, pickups, lanes, gradeToLane],
  );

  return { lanes, lane, setLane, visible };
}
