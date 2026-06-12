import './WeeklySummary.css';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Build a 7-day window ending today from a {date: minutes} history map.
 */
function buildWeek(history) {
  const map = history || {};
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const minutes = Number(map[key]) || 0;
    days.push({
      key,
      label: DAY_LABELS[d.getDay()],
      minutes,
      active: minutes > 0,
    });
  }
  return days;
}

/**
 * WeeklySummary - lightweight weekly overview of focus activity.
 * Shows which days had activity, a consistency indicator, and an empty state.
 */
function WeeklySummary({ dailyHistory, currentStreak = 0 }) {
  const week = buildWeek(dailyHistory);
  const activeDays = week.filter((d) => d.active).length;
  const hasActivity = activeDays > 0;
  const consistency = Math.round((activeDays / 7) * 100);

  return (
    <section className="weekly-summary" aria-label="Weekly activity summary">
      <h3 className="weekly-summary__title">🗓️ This Week</h3>

      {!hasActivity ? (
        <p className="weekly-summary__empty">
          No focus activity yet this week. Complete a session to start your streak!
        </p>
      ) : (
        <>
          <ul className="weekly-summary__days" role="list">
            {week.map((day) => (
              <li
                key={day.key}
                className={`weekly-summary__day${day.active ? ' is-active' : ''}`}
                title={`${day.label}: ${day.minutes} min focused`}
              >
                <span className="weekly-summary__dot" aria-hidden="true">
                  {day.active ? '●' : '○'}
                </span>
                <span className="weekly-summary__label">{day.label}</span>
              </li>
            ))}
          </ul>

          <div className="weekly-summary__metrics">
            <span className="weekly-summary__metric">
              <strong>{activeDays}/7</strong> active days
            </span>
            <span className="weekly-summary__metric">
              <strong>{consistency}%</strong> consistency
            </span>
            {currentStreak > 0 && (
              <span className="weekly-summary__metric">
                🔥 <strong>{currentStreak}</strong> day streak
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default WeeklySummary;
