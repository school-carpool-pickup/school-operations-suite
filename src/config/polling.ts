/**
 * Refresh cadences for screens that show live state.
 *
 * The pickup boards are watched while cars queue at the gate, so they have to
 * keep up on their own: before this they only refetched on a manual reload,
 * and a pickup cancelled from a parent's phone looked like nothing had
 * happened until the operator hit refresh.
 */

/** Admin + staff pickup boards. */
export const PICKUP_BOARD_POLL_MS = 5_000;
