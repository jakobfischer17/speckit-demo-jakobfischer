import { useState, useCallback } from 'react';
import { useGoals } from '../../hooks/useGoals';
import GoalCard from './GoalCard';
import './StreakTracker.css';

/**
 * StreakTracker
 *
 * Lets the user define their own daily goals (habits) and check them off each
 * day. Each goal tracks its own streak, 28-day calendar, and milestone rewards.
 */
function StreakTracker() {
  const { goals, addGoal, removeGoal, toggleToday, toggleDate, GOAL_ICONS } = useGoals();

  const [draftName, setDraftName] = useState('');
  const [draftIcon, setDraftIcon] = useState(GOAL_ICONS[0]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const name = draftName.trim();
      if (!name) return;
      addGoal(name, draftIcon);
      setDraftName('');
      setDraftIcon(GOAL_ICONS[0]);
    },
    [draftName, draftIcon, addGoal, GOAL_ICONS],
  );

  return (
    <section className="streak-tracker" aria-label="Daily goals streak tracker">
      <div className="streak-tracker__header">
        <h3 className="streak-tracker__title">🎯 Daily Goals</h3>
        <p className="streak-tracker__subtitle">
          Set your own goals and check them off each day to build a streak.
        </p>
      </div>

      <form className="streak-tracker__add" onSubmit={handleSubmit}>
        <div className="streak-tracker__icon-picker" role="radiogroup" aria-label="Goal icon">
          {GOAL_ICONS.map((icon) => (
            <button
              type="button"
              key={icon}
              className={`streak-tracker__icon-option ${draftIcon === icon ? 'streak-tracker__icon-option--active' : ''}`}
              onClick={() => setDraftIcon(icon)}
              aria-label={`Icon ${icon}`}
              aria-pressed={draftIcon === icon}
            >
              {icon}
            </button>
          ))}
        </div>
        <div className="streak-tracker__add-row">
          <input
            type="text"
            className="streak-tracker__add-input"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="New goal (e.g. Read 30 min)"
            maxLength={40}
            aria-label="New goal name"
          />
          <button
            type="submit"
            className="streak-tracker__add-button"
            disabled={!draftName.trim()}
          >
            Add goal
          </button>
        </div>
      </form>

      {goals.length === 0 ? (
        <div className="streak-tracker__empty">
          <p className="streak-tracker__empty-icon" aria-hidden="true">🌱</p>
          <p>No goals yet. Add your first daily goal above to start a streak!</p>
        </div>
      ) : (
        <div className="streak-tracker__goals">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggleToday={toggleToday}
              onToggleDate={toggleDate}
              onRemove={removeGoal}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default StreakTracker;
