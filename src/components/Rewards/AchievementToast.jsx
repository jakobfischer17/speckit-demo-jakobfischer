import { useEffect, useState, useCallback } from 'react';
import './AchievementToast.css';

/**
 * Achievement toast notification component.
 * Displays milestone achievement with slide-in animation.
 * 
 * @param {Object} props
 * @param {Object} props.achievement - Achievement data { title, subtitle, milestone }
 * @param {boolean} props.visible - Whether toast should be showing
 * @param {Function} props.onDismiss - Callback when toast is dismissed
 * @param {number} props.autoDismissDelay - Auto dismiss delay in ms (default: 5000)
 */
function AchievementToast({
  achievement,
  visible = false,
  onDismiss,
  autoDismissDelay = 5000,
}) {
  const [isShowing, setIsShowing] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Get milestone icon based on count
  const getMilestoneIcon = useCallback((milestone) => {
    switch (milestone) {
      case 10:
        return '🌟';
      case 25:
        return '🏆';
      case 50:
        return '💎';
      case 100:
        return '👑';
      default:
        return '🎉';
    }
  }, []);

  // Handle dismiss animation
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsShowing(false);
      setIsExiting(false);
      onDismiss?.();
    }, 300); // Match CSS transition duration
  }, [onDismiss]);

  // Show/hide based on visible prop
  useEffect(() => {
    if (visible && achievement) {
      setIsShowing(true);
      setIsExiting(false);
    }
  }, [visible, achievement]);

  // Auto-dismiss after delay
  useEffect(() => {
    if (isShowing && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [isShowing, autoDismissDelay, handleDismiss]);

  // Handle keyboard dismiss (Escape key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isShowing) {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isShowing, handleDismiss]);

  if (!isShowing || !achievement) return null;

  const toastClasses = [
    'achievement-toast',
    isExiting ? 'achievement-toast--exiting' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={toastClasses}
      role="alert"
      aria-live="polite"
    >
      <div className="achievement-toast__icon">
        {getMilestoneIcon(achievement.milestone)}
      </div>
      <div className="achievement-toast__content">
        <h3 className="achievement-toast__title">
          {achievement.title}
        </h3>
        <p className="achievement-toast__subtitle">
          {achievement.subtitle}
        </p>
      </div>
      <button
        className="achievement-toast__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss achievement notification"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default AchievementToast;
