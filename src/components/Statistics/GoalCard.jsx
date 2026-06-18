import { useStreak } from '../../hooks/useStreak';
import { todayString } from '../../utils/date';

/**
 * GoalCard – renders a single custom goal: a today check-off control, the
 * current streak, an animated reward when a milestone is hit, and a 28-day
 * completion calendar.
 *
 * @param {Object} props
 * @param {Object} props.goal            { id, name, icon, completions }
 * @param {Function} props.onToggleToday Called with goal id to flip today
 * @param {Function} props.onToggleDate  Called with (goal id, dateKey)
 * @param {Function} props.onRemove      Called with goal id to delete
 */
function GoalCard({ goal, onToggleToday, onToggleDate, onRemove }) {
  const { calendar, streak, currentReward } = useStreak({ completions: goal.completions });
  const today = todayString();
  const doneToday = Boolean(goal.completions?.[today]);

  return (
    <article className="goal-card" aria-label={`Goal: ${goal.name}`}>
      <div className="goal-card__header">
        <h4 className="goal-card__title">
          <span className="goal-card__icon" aria-hidden="true">{goal.icon}</span>
          <span className="goal-card__name">{goal.name}</span>
        </h4>
        <button
          type="button"
          className="goal-card__delete"
          onClick={() => onRemove(goal.id)}
          aria-label={`Delete goal ${goal.name}`}
          title="Delete goal"
        >
          ✕
        </button>
      </div>

      <div className="goal-card__row">
        <button
          type="button"
          className={`goal-card__check ${doneToday ? 'goal-card__check--done' : ''}`}
          onClick={() => onToggleToday(goal.id)}
          aria-pressed={doneToday}
        >
          <span className="goal-card__check-box" aria-hidden="true">
            {doneToday ? '✅' : '○'}
          </span>
          {doneToday ? 'Done today' : 'Mark done today'}
        </button>

        <div className="goal-card__streak" aria-label={`Current streak: ${streak} days`}>
          <span className="goal-card__streak-number">{streak}</span>
          <span className="goal-card__streak-unit">
            day{streak !== 1 ? 's' : ''}<br />streak
          </span>
        </div>
      </div>

      {currentReward && (
        <div className="goal-card__reward" role="status" aria-live="polite">
          <span className="goal-card__reward-icon" aria-hidden="true">{currentReward.icon}</span>
          <div className="goal-card__reward-text">
            <p className="goal-card__reward-label">{currentReward.label}</p>
            <p className="goal-card__reward-message">{currentReward.message}</p>
          </div>
        </div>
      )}

      <div className="goal-card__calendar" role="list" aria-label="28-day completion calendar">
        {calendar.map((day) => {
          const classes = [
            'goal-card__day',
            day.completed ? 'goal-card__day--done' : '',
            day.isToday ? 'goal-card__day--today' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              type="button"
              key={day.key}
              className={classes}
              role="listitem"
              onClick={() => onToggleDate(goal.id, day.key)}
              title={`${day.key}: ${day.completed ? 'done' : 'not done'} (click to toggle)`}
              aria-label={`${day.key}: ${day.completed ? 'completed' : 'not completed'}`}
              aria-pressed={day.completed}
            >
              <span className="goal-card__day-check" aria-hidden="true">
                {day.completed ? '✅' : '○'}
              </span>
              <span className="goal-card__day-label">{day.label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

export default GoalCard;
