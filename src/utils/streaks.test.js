// Run with:  npm test
// Uses Node's built-in test runner, so no extra dependencies are needed.

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCurrentStreak, calculateLongestStreak, getStreaks } from './streaks.js';

// In June 2025: 2 = Monday, 3 = Tuesday, 4 = Wednesday, 5 = Thursday, 6 = Friday.
const MON = '2025-06-02';
const TUE = '2025-06-03';
const WED = '2025-06-04';
const THU = '2025-06-05';
const FRI = '2025-06-06';

test('the spec example: done Mon, Tue, missed Wed, done Thu -> current 1, longest 2', () => {
  const dates = [MON, TUE, THU];
  assert.deepEqual(getStreaks(dates, THU), { current: 1, longest: 2 });
});

test('no completions at all -> 0 and 0', () => {
  assert.deepEqual(getStreaks([], THU), { current: 0, longest: 0 });
});

test('done today only -> streak of 1', () => {
  assert.equal(calculateCurrentStreak([THU], THU), 1);
});

test('streak stays alive when today is not done yet but yesterday was', () => {
  // Mon, Tue, Wed done; it is Thursday and the user has not checked in yet.
  assert.equal(calculateCurrentStreak([MON, TUE, WED], THU), 3);
});

test('streak resets to 0 once a full day is missed', () => {
  // Last done Tuesday; it is now Thursday, so Wednesday was missed.
  assert.equal(calculateCurrentStreak([MON, TUE], THU), 0);
  // ...but the longest streak is remembered.
  assert.equal(calculateLongestStreak([MON, TUE]), 2);
});

test('current streak only counts the most recent run, not older ones', () => {
  // Old 3-day run, a gap, then a 2-day run ending today.
  const dates = ['2025-05-01', '2025-05-02', '2025-05-03', THU, FRI];
  assert.deepEqual(getStreaks(dates, FRI), { current: 2, longest: 3 });
});

test('longest streak can be older than the current streak', () => {
  const dates = [MON, TUE, WED, FRI];
  assert.deepEqual(getStreaks(dates, FRI), { current: 1, longest: 3 });
});

test('works across a month boundary', () => {
  const dates = ['2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02'];
  assert.equal(calculateCurrentStreak(dates, '2025-02-02'), 4);
  assert.equal(calculateLongestStreak(dates), 4);
});

test('works across a year boundary', () => {
  const dates = ['2024-12-31', '2025-01-01'];
  assert.equal(calculateCurrentStreak(dates, '2025-01-01'), 2);
  assert.equal(calculateLongestStreak(dates), 2);
});

test('works across a leap day', () => {
  const dates = ['2024-02-28', '2024-02-29', '2024-03-01'];
  assert.equal(calculateLongestStreak(dates), 3);
});

test('is not confused by daylight-saving changes', () => {
  // US clocks change on 2025-03-09 and 2025-11-02. Streaks must not break there.
  const spring = ['2025-03-08', '2025-03-09', '2025-03-10'];
  const autumn = ['2025-11-01', '2025-11-02', '2025-11-03'];
  assert.equal(calculateLongestStreak(spring), 3);
  assert.equal(calculateCurrentStreak(spring, '2025-03-10'), 3);
  assert.equal(calculateLongestStreak(autumn), 3);
  assert.equal(calculateCurrentStreak(autumn, '2025-11-03'), 3);
});

test('duplicates and unsorted input are handled', () => {
  const dates = [THU, MON, TUE, TUE, MON];
  assert.deepEqual(getStreaks(dates, THU), { current: 1, longest: 2 });
});

test('a future date does not create a current streak', () => {
  // Bad data / clock changes: a date after "today" must not count.
  assert.equal(calculateCurrentStreak([FRI], THU), 0);
});

test('does not mutate the array it is given', () => {
  const dates = [THU, MON];
  calculateLongestStreak(dates);
  calculateCurrentStreak(dates, THU);
  assert.deepEqual(dates, [THU, MON]);
});
