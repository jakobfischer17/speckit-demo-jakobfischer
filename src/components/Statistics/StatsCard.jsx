import './Statistics.css';

/**
 * Stats card component displaying a single metric.
 * 
 * @param {Object} props
 * @param {string} props.icon - Emoji or icon to display
 * @param {string} props.label - Label describing the stat
 * @param {string|number} props.value - The stat value
 * @param {string} props.sublabel - Optional secondary information
 * @param {string} props.variant - Optional color variant ('primary', 'secondary', 'success', 'warning')
 */
function StatsCard({ icon, label, value, sublabel, variant = 'primary' }) {
  return (
    <article className={`stats-card stats-card--${variant}`}>
      <div className="stats-card__icon">{icon}</div>
      <div className="stats-card__content">
        <span className="stats-card__value">{value}</span>
        <span className="stats-card__label">{label}</span>
        {sublabel && (
          <span className="stats-card__sublabel">{sublabel}</span>
        )}
      </div>
    </article>
  );
}

export default StatsCard;
