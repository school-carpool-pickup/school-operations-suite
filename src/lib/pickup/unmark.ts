import type { AdminPickup } from '@/types';

/** Backend code for an Unmark refused because the ten-minute window closed. */
export const UNMARK_EXPIRED_CODE = '40011';

/**
 * Whether Unmark should be offered for this pickup right now.
 *
 * The backend allows unmarking for ten minutes after completion and reports
 * that as `can_unmark`, with the cut-off in `unmark_deadline`. Both are
 * checked: `can_unmark` is the backend's word at fetch time, and the deadline
 * lets the button disappear the instant it passes on a board left open between
 * polls.
 *
 * The window exists because of a real incident: unmarking a pickup completed
 * days earlier, then marking it again, left the system believing the child had
 * already gone home that day.
 */
export function isUnmarkOpen(
  pickup: Pick<AdminPickup, 'can_unmark' | 'unmark_deadline'>,
  now: number = Date.now(),
): boolean {
  // Older backends don't send the flag at all; nothing to gate on.
  if (pickup.can_unmark === undefined) return true;
  if (!pickup.can_unmark) return false;
  if (!pickup.unmark_deadline) return true;
  return now < Date.parse(pickup.unmark_deadline);
}

/** The soonest still-open unmark deadline, or null — for scheduling a refresh. */
export function nextUnmarkDeadline(
  pickups: readonly Pick<AdminPickup, 'can_unmark' | 'unmark_deadline'>[],
  now: number = Date.now(),
): number | null {
  let soonest: number | null = null;
  for (const p of pickups) {
    if (!p.can_unmark || !p.unmark_deadline) continue;
    const at = Date.parse(p.unmark_deadline);
    if (Number.isNaN(at) || at <= now) continue;
    if (soonest === null || at < soonest) soonest = at;
  }
  return soonest;
}

/** Was this mutation refused because the unmark window had already closed? */
export function isUnmarkExpiredError(err: unknown): boolean {
  const code = (err as { response?: { data?: { error?: { code?: string } } } })
    ?.response?.data?.error?.code;
  return code === UNMARK_EXPIRED_CODE;
}
