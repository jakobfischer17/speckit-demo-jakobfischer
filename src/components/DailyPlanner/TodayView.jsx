import './TodayView.css';
import { format } from 'date-fns';
import QuickAdd from './QuickAdd';

/**
 * TodayView - Today's date header, task summary, and Top 3 focus section
 */
function TodayView({
  tasks = [],
  top3 = [],
  onQuickAdd,
  onGenerateTop3,
  onDismissTop3,
  isGeneratingTop3 = false,
}) {
  const today = new Date();
  const dateString = format(today, 'EEEE, MMMM d');
  const activeTasks = tasks.filter((t) => !t.completedAt);
  const hasTop3 = top3.length > 0;

  return (
    <div className="today-view">
      <header className="today-view__header">
        <div className="today-view__date-section">
          <h2 className="today-view__date">{dateString}</h2>
          <span className="today-view__year">{format(today, 'yyyy')}</span>
        </div>
        <div className="today-view__summary">
          <span className="today-view__task-count">
            {activeTasks.length} {activeTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </header>

      {/* Top 3 Focus Section */}
      {hasTop3 && (
        <div className="today-view__focus">
          <h3 className="today-view__focus-title">
            <span className="today-view__focus-icon">🎯</span>
            Today's Focus
          </h3>
          <div className="today-view__focus-list">
            {top3.map((task, index) => (
              <div key={task.id} className="today-view__focus-item">
                <span className="today-view__focus-position">{index + 1}</span>
                <div className="today-view__focus-content">
                  <span className="today-view__focus-task-title">{task.title}</span>
                  <span className="today-view__focus-reasoning">{task.reasoning}</span>
                </div>
                <button
                  className="today-view__focus-dismiss"
                  onClick={() => onDismissTop3(task.id)}
                  aria-label={`Dismiss ${task.title} from focus`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Top 3 Button (shown when no top 3 active) */}
      {!hasTop3 && activeTasks.length >= 3 && (
        <button
          className="today-view__generate-btn"
          onClick={onGenerateTop3}
          disabled={isGeneratingTop3}
        >
          {isGeneratingTop3 ? 'Generating...' : '🎯 Generate Top 3 Focus'}
        </button>
      )}

      {/* Quick Add */}
      <QuickAdd
        onAdd={onQuickAdd}
        placeholder="Add a task for today..."
        autoFocus={false}
      />

      {/* Empty state */}
      {activeTasks.length === 0 && (
        <div className="today-view__empty">
          <span className="today-view__empty-icon">✨</span>
          <p className="today-view__empty-text">
            No tasks for today. Add one above to get started!
          </p>
        </div>
      )}
    </div>
  );
}

export default TodayView;
