import { useMemo } from 'react';
import { toLocalDateString } from '../utils/date.js';

/**
 * Streak milestone definitions, ordered from highest to lowest.
 * Each milestone has an icon and message shown as a reward.
 */
export const STREAK_MILESTONES = [
  { days: 30, icon: '👑', label: 'Monthly Master',   message: "30 days! You're unstoppable!" },
  { days: 14, icon: '💎', label: 'Two-Week Legend',  message: '14 days of hitting your goal!' },
  { days:  7, icon: '🏆', label: 'Week Champion',    message: 'A full week streak!' },
  { days:  5, icon: '🔥', label: 'On Fire',          message: "5 days straight — you're on fire!" },
  { days:  3, icon: '⚡', label: 'On a Roll',        message: '3 days in a row!' },
];

const CALENDAR_DAYS = 28;

/**
 * Build a 28-day calendar window ending today from a completion map.
 *
 * @param {Object} completions  { 'YYYY-MM-DD': true } – days the goal was done
 * @returns {Array<{key, label, completed, isToday}>}
 */
function buildCalendar(completions) {
  const map = completions || {};
  const today = new Date();
  const days = [];

  for (let i = CALENDAR_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toLocalDateString(d);
    days.push({
      key,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      completed: Boolean(map[key]),
      isToday: i === 0,
    });
  }

  return days;
}

/**
 * Calculate consecutive days the goal was completed, counting backwards from
 * the most recent completed day. Today is included when already completed;
 * otherwise the streak counts from yesterday so an in-progress day never
 * breaks an existing streak.
 *
 * @param {Array} calendar  Output of buildCalendar
 * @returns {number}
 */
function calcStreak(calendar) {
  let streak = 0;
  for (let i = calendar.length - 1; i >= 0; i--) {
    const day = calendar[i];
    if (day.isToday && !day.completed) {
      // Today isn't done yet; keep going to include yesterday.
      continue;
    }
    if (day.completed) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Resolve the highest milestone reached for a given streak length.
 * @param {number} streak
 * @returns {Object|null}
 */
export function rewardForStreak(streak) {
  for (const milestone of STREAK_MILESTONES) {
    if (streak >= milestone.days) {
      return milestone;
    }
  }
  return null;
}

/**
 * useStreak – derive a 28-day calendar, current streak, and active reward from
 * a map of completed days. Works for any daily goal (a custom habit, a
 * pomodoro target, etc.) as long as completion is expressed as
 * { 'YYYY-MM-DD': true }.
 *
 * @param {Object} params
 * @param {Object} params.completions  { 'YYYY-MM-DD': true }
 * @returns {{ calendar, streak, currentReward, STREAK_MILESTONES }}
 */
export function useStreak({ completions = {} } = {}) {
  const calendar = useMemo(() => buildCalendar(completions), [completions]);
  const streak = useMemo(() => calcStreak(calendar), [calendar]);
  const currentReward = useMemo(() => rewardForStreak(streak), [streak]);

  return { calendar, streak, currentReward, STREAK_MILESTONES };
}

export default useStreak;
