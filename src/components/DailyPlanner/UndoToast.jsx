import { useEffect, useState, useCallback } from 'react';
import './UndoToast.css';

/**
 * UndoToast - 5-second undo notification for deleted tasks
 * FR-031: Soft delete with undo option within 5 seconds
 */
function UndoToast({
  pendingDelete,
  onUndo,
  duration = 5000,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [currentTask, setCurrentTask] = useState(null);

  useEffect(() => {
    if (!pendingDelete) {
      setIsVisible(false);
      return;
    }

    // Show toast
    setIsVisible(true);
    setCurrentTask(pendingDelete);
    setProgress(100);

    // Animate progress bar
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 50);

    // Auto-hide after duration
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pendingDelete, duration]);

  const handleUndo = useCallback(() => {
    onUndo?.();
    setIsVisible(false);
  }, [onUndo]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible || !currentTask) {
    return null;
  }

  return (
    <div
      className="undo-toast"
      role="alert"
      aria-live="polite"
    >
      <div className="undo-toast__content">
        <span className="undo-toast__icon" aria-hidden="true">🗑️</span>
        <span className="undo-toast__message">
          Task "{currentTask.title}" deleted
        </span>
        <button
          type="button"
          className="undo-toast__undo"
          onClick={handleUndo}
        >
          Undo
        </button>
        <button
          type="button"
          className="undo-toast__dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      <div
        className="undo-toast__progress"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

export default UndoToast;
