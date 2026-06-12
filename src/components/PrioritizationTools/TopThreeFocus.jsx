import { useCallback } from 'react';
import './TopThreeFocus.css';
import { useTop3Focus } from '../../hooks/useTop3Focus';

/**
 * TopThreeFocus - Generate 3 suggested focus tasks
 * FR-037: Deadline-first algorithm with dismissal
 */
function TopThreeFocus({ tasks = [] }) {
  const {
    top3,
    isGenerating,
    generatedAt,
    generate,
    dismiss,
    refresh,
    clear,
  } = useTop3Focus(tasks);

  const hasTop3 = top3.length > 0 && generatedAt;
  const canGenerate = tasks.length >= 3;

  const handleGenerate = useCallback(() => {
    generate();
  }, [generate]);

  const handleDismiss = useCallback(
    (taskId) => {
      dismiss(taskId);
    },
    [dismiss]
  );

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleClear = useCallback(() => {
    clear();
  }, [clear]);

  return (
    <div className="top-three-focus">
      <header className="top-three-focus__header">
        <h3 className="top-three-focus__title">
          <span className="top-three-focus__icon" aria-hidden="true">🎯</span>
          Top 3 Focus
        </h3>
        <p className="top-three-focus__description">
          Let the algorithm suggest your most important tasks
        </p>
      </header>

      {!hasTop3 && (
        <div className="top-three-focus__empty">
          {canGenerate ? (
            <button
              className="top-three-focus__generate-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Analyzing...' : 'Generate Top 3'}
            </button>
          ) : (
            <p className="top-three-focus__hint">
              Add at least 3 tasks to use this feature
            </p>
          )}
        </div>
      )}

      {hasTop3 && (
        <>
          <div className="top-three-focus__list">
            {top3.map((item, index) => (
              <div
                key={item.id}
                className="top-three-focus__card"
              >
                <div className="top-three-focus__position">
                  {index + 1}
                </div>
                <div className="top-three-focus__content">
                  <span className="top-three-focus__task-title">
                    {item.title}
                  </span>
                  {item.reasoning && (
                    <span className="top-three-focus__reasoning">
                      {item.reasoning}
                    </span>
                  )}
                </div>
                <button
                  className="top-three-focus__dismiss"
                  onClick={() => handleDismiss(item.id)}
                  aria-label={`Dismiss ${item.title}`}
                  title="Dismiss and suggest replacement"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="top-three-focus__actions">
            <button
              className="top-three-focus__action-btn top-three-focus__action-btn--secondary"
              onClick={handleRefresh}
              disabled={isGenerating}
            >
              ↻ Regenerate
            </button>
            <button
              className="top-three-focus__action-btn"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>

          {generatedAt && (
            <p className="top-three-focus__timestamp">
              Generated {new Date(generatedAt).toLocaleTimeString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default TopThreeFocus;
