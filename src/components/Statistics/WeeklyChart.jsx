import { useMemo } from 'react';
import './Statistics.css';

/**
 * Weekly chart component displaying 7-day focus history.
 * Uses CSS-only bars for performance.
 * 
 * @param {Object} props
 * @param {Array<{date: string, minutes: number}>} props.data - 7 days of focus data
 * @param {string} props.title - Chart title
 */
function WeeklyChart({ data = [], title = 'This Week' }) {
  // Calculate max value for scaling
  const maxMinutes = useMemo(() => {
    const max = Math.max(...data.map(d => d.minutes), 1);
    // Round up to nearest nice number
    return Math.ceil(max / 30) * 30 || 60;
  }, [data]);

  // Format day names
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yest';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
  };

  // Generate last 7 days if no data provided
  const chartData = useMemo(() => {
    if (data.length === 7) return data;
    
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existing = data.find(d => d.date === dateStr);
      days.push({
        date: dateStr,
        minutes: existing?.minutes || 0,
      });
    }
    return days;
  }, [data]);

  // Format minutes to display
  const formatMinutes = (minutes) => {
    if (minutes === 0) return '0';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="weekly-chart">
      <h3 className="weekly-chart__title">{title}</h3>
      
      <div className="weekly-chart__container" role="img" aria-label={`Weekly focus time chart. Maximum: ${maxMinutes} minutes`}>
        {/* Y-axis labels */}
        <div className="weekly-chart__y-axis">
          <span>{formatMinutes(maxMinutes)}</span>
          <span>{formatMinutes(maxMinutes / 2)}</span>
          <span>0</span>
        </div>
        
        {/* Bars */}
        <div className="weekly-chart__bars">
          {chartData.map((day, index) => {
            const heightPercent = (day.minutes / maxMinutes) * 100;
            return (
              <div 
                key={day.date}
                className="weekly-chart__bar-container"
              >
                <div 
                  className="weekly-chart__bar"
                  style={{ height: `${heightPercent}%` }}
                  role="presentation"
                  aria-label={`${getDayName(day.date)}: ${formatMinutes(day.minutes)}`}
                >
                  {day.minutes > 0 && (
                    <span className="weekly-chart__bar-value">
                      {formatMinutes(day.minutes)}
                    </span>
                  )}
                </div>
                <span className="weekly-chart__day-label">
                  {getDayName(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeeklyChart;
