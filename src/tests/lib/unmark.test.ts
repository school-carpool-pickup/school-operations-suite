import { describe, expect, it } from 'vitest';
import {
  isUnmarkExpiredError,
  isUnmarkOpen,
  nextUnmarkDeadline,
} from '@/lib/pickup/unmark';

const NOW = Date.parse('2026-10-14T08:00:00Z');
const in5m = '2026-10-14T08:05:00Z';
const ago5m = '2026-10-14T07:55:00Z';

describe('isUnmarkOpen', () => {
  it('is open inside the window', () => {
    expect(isUnmarkOpen({ can_unmark: true, unmark_deadline: in5m }, NOW)).toBe(
      true,
    );
  });

  it('closes the moment the deadline passes, even if the board still says so', () => {
    // A board left open between polls still holds can_unmark: true.
    expect(
      isUnmarkOpen({ can_unmark: true, unmark_deadline: ago5m }, NOW),
    ).toBe(false);
  });

  it('defers to the backend when it says no', () => {
    expect(
      isUnmarkOpen({ can_unmark: false, unmark_deadline: in5m }, NOW),
    ).toBe(false);
  });

  it('allows it on an older backend that sends no flag', () => {
    expect(isUnmarkOpen({}, NOW)).toBe(true);
  });
});

describe('nextUnmarkDeadline', () => {
  it('picks the soonest open deadline and ignores closed ones', () => {
    expect(
      nextUnmarkDeadline(
        [
          { can_unmark: true, unmark_deadline: '2026-10-14T08:09:00Z' },
          { can_unmark: true, unmark_deadline: in5m },
          { can_unmark: true, unmark_deadline: ago5m },
          { can_unmark: false, unmark_deadline: '2026-10-14T08:01:00Z' },
        ],
        NOW,
      ),
    ).toBe(Date.parse(in5m));
  });

  it('is null when nothing is pending', () => {
    expect(nextUnmarkDeadline([{ can_unmark: false }], NOW)).toBeNull();
  });
});

describe('isUnmarkExpiredError', () => {
  it('recognises the backend code', () => {
    expect(
      isUnmarkExpiredError({
        response: { data: { error: { code: '40011' } } },
      }),
    ).toBe(true);
  });

  it('ignores anything else', () => {
    expect(
      isUnmarkExpiredError({
        response: { data: { error: { code: '40001' } } },
      }),
    ).toBe(false);
    expect(isUnmarkExpiredError(new Error('network'))).toBe(false);
  });
});
