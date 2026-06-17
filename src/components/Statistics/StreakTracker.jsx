import { useCallback } from 'react';
import { useStreak } from '../../hooks/useStreak';
import './StreakTracker.css';

/**
 * StreakTracker
 *
 * Lets the user set a daily pomodoro goal, then renders a 28-day calendar
 * showing which days the goal was met (✅) and celebrates consecutive
 * streaks with an animated reward banner.
 *
 * @param {Object} props
 * @param {Object} props.dailyPomodoros  Per-day pomodoro counts from stats
 * @param {number} props.dailyGoal       Current goal (from preferences)
 * @param {Function} props.onGoalChange  Called with new goal number
 */
function StreakTracker({ dailyPomodoros = {}, dailyGoal = 1, onGoalChange }) {
  const { calendar, goalStreak, currentReward } = useStreak({ dailyPomodoros, dailyGoal });

  const handleGoalChange = useCallback(
    (e) => {
      const val = parseInt(e.target.value, 10);
      if (Number.isFinite(val) && val >= 1 && val <= 20) {
        onGoalChange?.(val);
      }
    },
    [onGoalChange],
  );

  return (
    <section className="streak-tracker" aria-label="Daily streak tracker">
      {/* Header: title + goal setter */}
      <div className="streak-tracker__header">
        <h3 className="streak-tracker__title">🗓️ Daily Streak</h3>
        <label className="streak-tracker__goal">
          <span className="streak-tracker__goal-label">Daily goal:</span>
          <input
            type="number"
            className="streak-tracker__goal-input"
            value={dailyGoal}
            min={1}
            max={20}
            onChange={handleGoalChange}
            aria-label="Daily pomodoro goal"
          />
          <span>🍅/day</span>
        </label>
      </div>

      {/* Reward banner (shown when a milestone streak is active) */}
      {currentReward && (
        <div className="streak-tracker__reward" role="status" aria-live="polite">
          <span className="streak-tracker__reward-icon" aria-hidden="true">
            {currentReward.icon}
          </span>
          <div className="streak-tracker__reward-text">
            <p className="streak-tracker__reward-label">{currentReward.label}</p>
            <p className="streak-tracker__reward-message">{currentReward.message}</p>
          </div>
        </div>
      )}

      {/* Current streak count */}
      <div className="streak-tracker__count" aria-label={`Current streak: ${goalStreak} days`}>
        <span className="streak-tracker__count-number">{goalStreak}</span>
        <span className="streak-tracker__count-unit">
          day{goalStreak !== 1 ? 's' : ''}<br />streak
        </span>
      </div>

      {/* 28-day calendar grid */}
      <div
        className="streak-tracker__calendar"
        role="list"
        aria-label="28-day activity calendar"
      >
        {calendar.map((day) => {
          const classes = [
            'streak-tracker__day',
            day.goalMet ? 'streak-tracker__day--met' : '',
            day.isToday ? 'streak-tracker__day--today' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={day.key}
              className={classes}
              role="listitem"
              title={`${day.key}: ${day.count} 🍅 (goal: ${dailyGoal})`}
              aria-label={`${day.key}: ${day.count} pomodoro${day.count !== 1 ? 's' : ''}, goal ${day.goalMet ? 'met' : 'not met'}`}
            >
              <span className="streak-tracker__day-check" aria-hidden="true">
                {day.goalMet ? '✅' : '○'}
              </span>
              <span className="streak-tracker__day-label">{day.label}</span>
              {day.count > 0 && (
                <span className="streak-tracker__day-count">{day.count}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="streak-tracker__legend" aria-hidden="true">
        <span className="streak-tracker__legend-item">
          <span className="streak-tracker__legend-dot streak-tracker__legend-dot--met" />
          Goal met
        </span>
        <span className="streak-tracker__legend-item">
          <span className="streak-tracker__legend-dot streak-tracker__legend-dot--empty" />
          Not met
        </span>
      </div>
    </section>
  );
}

export default StreakTracker;
