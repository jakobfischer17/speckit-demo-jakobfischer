/**
 * Date helpers that operate in the user's local timezone.
 *
 * Using toISOString() returns a UTC date, which can roll over to the
 * previous/next day for users far from UTC (e.g. just after midnight local
 * time). These helpers build the YYYY-MM-DD key from local date components so
 * "today" always matches the user's wall clock.
 */

/**
 * Format a Date (or timestamp) as a local YYYY-MM-DD string.
 * @param {Date|number} [input] Date object or epoch ms; defaults to now.
 * @returns {string} Local date string in YYYY-MM-DD format.
 */
export function toLocalDateString(input = new Date()) {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Local date string for today.
 * @returns {string}
 */
export function todayString() {
  return toLocalDateString(new Date());
}

/**
 * Local date string N days from today (negative for past).
 * @param {number} offset Day offset relative to today.
 * @returns {string}
 */
export function dateStringWithOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toLocalDateString(d);
}
