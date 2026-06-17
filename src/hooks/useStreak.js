import { useMemo } from 'react';

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

function toDateString(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Build a 28-day calendar window ending today from the per-day pomodoro counts
 * and the user's daily goal.
 *
 * @param {Object} dailyPomodoros  { 'YYYY-MM-DD': count }
 * @param {number} dailyGoal       Target pomodoros per day (>= 1)
 * @returns {Array<{key, label, count, goalMet, isToday}>}
 */
function buildCalendar(dailyPomodoros, dailyGoal) {
  const map = dailyPomodoros || {};
  const today = new Date();
  const days = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDateString(d);
    const count = Number(map[key]) || 0;
    const goalMet = dailyGoal > 0 && count >= dailyGoal;
    days.push({
      key,
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count,
      goalMet,
      isToday: i === 0,
    });
  }

  return days;
}

/**
 * Calculate consecutive days where the daily goal was met, counting
 * backwards from the most recent completed day.
 * Today is included if the goal has already been met today; otherwise
 * the streak counts from yesterday.
 *
 * @param {Array} calendar  Output of buildCalendar
 * @returns {number}
 */
function calcGoalStreak(calendar) {
  let streak = 0;
  // Walk backwards from today
  for (let i = calendar.length - 1; i >= 0; i--) {
    const day = calendar[i];
    if (day.isToday && !day.goalMet) {
      // Today hasn't been completed yet; keep going to include yesterday
      continue;
    }
    if (day.goalMet) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * useStreak – derive a streak calendar and goal-streak from stored stats.
 *
 * @param {Object} params
 * @param {Object} params.dailyPomodoros  { 'YYYY-MM-DD': count } from stats
 * @param {number} params.dailyGoal       Pomodoros-per-day target from preferences
 * @returns {{ calendar, goalStreak, currentReward, STREAK_MILESTONES }}
 */
export function useStreak({ dailyPomodoros = {}, dailyGoal = 1 }) {
  const calendar = useMemo(
    () => buildCalendar(dailyPomodoros, dailyGoal),
    [dailyPomodoros, dailyGoal],
  );

  const goalStreak = useMemo(() => calcGoalStreak(calendar), [calendar]);

  const currentReward = useMemo(() => {
    for (const milestone of STREAK_MILESTONES) {
      if (goalStreak >= milestone.days) {
        return milestone;
      }
    }
    return null;
  }, [goalStreak]);

  return { calendar, goalStreak, currentReward, STREAK_MILESTONES };
}

export default useStreak;
