'use client';

import { useEffect, useState } from 'react';
import { nextUnmarkDeadline } from '@/lib/pickup/unmark';
import type { AdminPickup } from '@/types';

/**
 * Re-render the board at the next unmark deadline, so an Unmark button
 * disappears the instant its ten-minute window closes — not at the next poll,
 * and not never, on a tab whose polling has paused.
 *
 * Schedules a single timeout for the soonest open deadline rather than ticking
 * every second; returns the current time for `isUnmarkOpen` to compare against.
 */
export function useUnmarkClock(
  pickups: readonly Pick<AdminPickup, 'can_unmark' | 'unmark_deadline'>[],
): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const at = nextUnmarkDeadline(pickups, now);
    if (at === null) return;
    // +50ms so we land just past the deadline, not a hair before it.
    const timer = setTimeout(() => setNow(Date.now()), at - Date.now() + 50);
    return () => clearTimeout(timer);
  }, [pickups, now]);

  return now;
}
