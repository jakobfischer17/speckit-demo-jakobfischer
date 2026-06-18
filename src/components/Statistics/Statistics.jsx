import { useStats } from '../../hooks/useStats';
import StatsCard from './StatsCard';
import WeeklyChart from './WeeklyChart';
import WeeklySummary from './WeeklySummary';
import StreakTracker from './StreakTracker';
import './Statistics.css';

/**
 * Statistics dashboard component.
 * Displays focus totals, streaks, and weekly chart.
 */
function Statistics() {
  const {
    stats,
    dailyHistory,
    isLoading,
    error,
    formattedTotalTime,
    todayFocusTime,
  } = useStats();

  if (isLoading) {
    return (
      <div className="statistics-container statistics-container--loading">
        <div className="statistics-loading">
          <div className="statistics-loading__spinner" />
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-container statistics-container--error">
        <div className="statistics-error">
          <span className="statistics-error__icon">⚠️</span>
          <p>Failed to load statistics</p>
          <p className="statistics-error__detail">{error}</p>
        </div>
      </div>
    );
  }

  // Convert dailyHistory to chart format
  const chartData = Object.entries(dailyHistory || {})
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  return (
    <div className="statistics-container">
      <h2 className="statistics-title">📊 Focus Statistics</h2>
      <p className="statistics-subtitle">Track your productivity journey</p>

      {/* Stats cards grid */}
      <div className="statistics-cards">
        <StatsCard
          icon="🍅"
          label="Total Sessions"
          value={stats?.totalPomodoros || 0}
          sublabel="completed"
          variant="primary"
        />
        <StatsCard
          icon="⏱️"
          label="Total Focus Time"
          value={formattedTotalTime || '0h 0m'}
          sublabel="all time"
          variant="secondary"
        />
        <StatsCard
          icon="🔥"
          label="Current Streak"
          value={`${stats?.currentStreak || 0} days`}
          sublabel={stats?.longestStreak ? `Best: ${stats.longestStreak} days` : undefined}
          variant="success"
        />
        <StatsCard
          icon="📅"
          label="Today"
          value={todayFocusTime || '0m'}
          sublabel="focus time"
          variant="warning"
        />
      </div>

      {/* Weekly chart */}
      <WeeklyChart data={chartData} title="Weekly Focus Overview" />

      {/* Weekly activity summary widget */}
      <WeeklySummary
        dailyHistory={dailyHistory}
        currentStreak={stats?.currentStreak || 0}
      />

      {/* Daily goals streak tracker with custom goals */}
      <StreakTracker />

      {/* Motivational message based on stats */}
      {stats && (
        <div className="statistics-motivation">
          {stats.currentStreak >= 7 && (
            <p className="motivation-message motivation-message--fire">
              🔥 Amazing! You&apos;ve been focused for {stats.currentStreak} days straight!
            </p>
          )}
          {stats.totalPomodoros === 0 && (
            <p className="motivation-message">
              👋 Start your first pomodoro session to begin tracking!
            </p>
          )}
          {stats.totalPomodoros > 0 && stats.totalPomodoros < 10 && (
            <p className="motivation-message">
              🌱 Great start! {10 - stats.totalPomodoros} more sessions to your first milestone!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Statistics;
