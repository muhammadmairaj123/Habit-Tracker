// Date helpers.
//
// Every "day" in this app is a plain string like "2025-06-05" (a "date key"),
// built from the user's LOCAL calendar date.
//
// Why not use date.toISOString()? It converts to UTC, so for someone in India
// or the US the key can be "tomorrow" or "yesterday" around midnight. Building
// the string from local year/month/day avoids that whole class of bug.
//
// Date keys also sort correctly as plain strings ("2025-06-05" < "2025-06-10"),
// which makes them easy to compare and store.

const pad = (n) => String(n).padStart(2, '0');

/** Date object -> "YYYY-MM-DD" using local time. */
export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" -> Date at local midnight. */
export function parseDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Today's date key. */
export function getTodayKey() {
  return toDateKey(new Date());
}

/** Add (or subtract, with a negative number) whole calendar days to a date key. */
export function addDays(key, amount) {
  const date = parseDateKey(key);
  // setDate works on calendar days, so daylight-saving changes can't shift the result.
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

/** Number of calendar days from key `a` to key `b` (b - a). */
export function daysBetween(a, b) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  // Date.UTC has no daylight-saving hours, so every day is exactly 86,400,000 ms.
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

/** Friendly label for tooltips and the header, e.g. "Thu, Jun 5, 2025". */
export function formatDateKey(key, options) {
  return parseDateKey(key).toLocaleDateString(
    undefined,
    options ?? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
  );
}
