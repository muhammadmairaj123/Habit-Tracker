// Streak calculation.
//
// Both functions are PURE: same input -> same output, no React, no localStorage,
// no reading the clock. "Today" is passed in as an argument, which is what makes
// them easy to unit test (see streaks.test.js).
//
// Input: `completedDates`, an array of date keys such as ["2025-06-02", "2025-06-03"].
// A date being in the array means the habit was done that day.

import { addDays, daysBetween } from './dates.js';

/**
 * CURRENT streak: how many consecutive days, counting back from today, were done.
 *
 * Rule for gaps: the streak is still "alive" if the habit was done today OR
 * yesterday. If today isn't done yet, the user still has until midnight to
 * check in, so we don't punish them early. If the last check-in was two or
 * more days ago, a full day was missed and the streak is 0.
 *
 * Approach: pick a starting day (today or yesterday), then walk backwards one
 * day at a time until we hit a day that isn't done.
 */
export function calculateCurrentStreak(completedDates, today) {
  const done = new Set(completedDates); // Set gives O(1) "was this day done?" lookups

  const yesterday = addDays(today, -1);
  let cursor;
  if (done.has(today)) {
    cursor = today;
  } else if (done.has(yesterday)) {
    cursor = yesterday; // not done yet today, but the streak is still alive
  } else {
    return 0; // missed at least one full day -> streak is broken
  }

  let streak = 0;
  while (done.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * LONGEST streak ever: the longest run of consecutive days anywhere in history.
 *
 * Approach: sort the dates oldest -> newest and scan once, keeping a running
 * count. If a date is exactly 1 day after the previous one, the run grows.
 * Any bigger gap means a day was missed, so the run restarts at 1.
 */
export function calculateLongestStreak(completedDates) {
  // new Set removes duplicates. Date keys sort correctly as plain strings.
  const sorted = [...new Set(completedDates)].sort();

  let longest = 0;
  let run = 0;
  let previous = null;

  for (const date of sorted) {
    const isNextDay = previous !== null && daysBetween(previous, date) === 1;
    run = isNextDay ? run + 1 : 1; // extend the run, or start a new one after a gap
    longest = Math.max(longest, run);
    previous = date;
  }
  return longest;
}

/** Convenience wrapper so components can get both numbers in one call. */
export function getStreaks(completedDates, today) {
  return {
    current: calculateCurrentStreak(completedDates, today),
    longest: calculateLongestStreak(completedDates),
  };
}
