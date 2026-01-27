import { useState, useEffect, useCallback } from 'react';
import './TaskHistory.css';
import { useTaskArchive } from '../../hooks/useTaskArchive';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * TaskHistory - View archived/completed tasks
 * FR-033: View history of completed tasks (optional for MVP)
 */
function TaskHistory() {
  const {
    archivedTasks,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    runArchive,
  } = useTaskArchive();

  const [isArchiving, setIsArchiving] = useState(false);

  // Run archive cleanup on mount
  useEffect(() => {
    runArchive();
  }, [runArchive]);

  const handleArchiveNow = useCallback(async () => {
    setIsArchiving(true);
    try {
      await runArchive();
      await refresh();
    } finally {
      setIsArchiving(false);
    }
  }, [runArchive, refresh]);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  return (
    <div className="task-history">
      <header className="task-history__header">
        <h2 className="task-history__title">
          <span className="task-history__icon" aria-hidden="true">📜</span>
          Task History
        </h2>
        <p className="task-history__subtitle">
          Completed tasks from the past 7 days
        </p>
      </header>

      <div className="task-history__actions">
        <button
          className="task-history__action-btn"
          onClick={handleArchiveNow}
          disabled={isArchiving}
        >
          {isArchiving ? 'Archiving...' : '🗄️ Archive Old Tasks'}
        </button>
        <button
          className="task-history__action-btn"
          onClick={refresh}
          disabled={isLoading}
        >
          ↻ Refresh
        </button>
      </div>

      {isLoading && archivedTasks.length === 0 ? (
        <div className="task-history__loading">
          <div className="task-history__spinner" />
          <p>Loading history...</p>
        </div>
      ) : archivedTasks.length === 0 ? (
        <div className="task-history__empty">
          <span className="task-history__empty-icon">📭</span>
          <p className="task-history__empty-text">
            No archived tasks yet. Complete some tasks and check back later!
          </p>
        </div>
      ) : (
        <>
          <div className="task-history__list">
            {archivedTasks.map((task) => (
              <div key={task.id} className="task-history__item">
                <div className="task-history__item-content">
                  <span className="task-history__item-title">{task.title}</span>
                  <div className="task-history__item-meta">
                    <span className="task-history__item-completed">
                      Completed {formatDistanceToNow(task.completedAt, { addSuffix: true })}
                    </span>
                    {task.archivedAt && (
                      <span className="task-history__item-archived">
                        Archived {format(task.archivedAt, 'MMM d')}
                      </span>
                    )}
                    {task.priority && (
                      <span
                        className={`task-history__item-priority task-history__item-priority--${task.priority}`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="task-history__load-more">
              <button
                className="task-history__load-more-btn"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}

          <p className="task-history__note">
            Tasks are automatically archived 7 days after completion
          </p>
        </>
      )}
    </div>
  );
}

export default TaskHistory;
