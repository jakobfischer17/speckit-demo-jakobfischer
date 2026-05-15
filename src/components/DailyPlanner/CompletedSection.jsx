import { useState, useCallback } from 'react';
import './CompletedSection.css';
import TaskItem from './TaskItem';

/**
 * CompletedSection - Collapsible section for completed tasks
 * Shows completed tasks with option to uncheck or delete
 */
function CompletedSection({
  tasks = [],
  onToggleComplete,
  onDelete,
  defaultCollapsed = false,
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="completed-section">
      <button
        type="button"
        className="completed-section__header"
        onClick={toggleCollapsed}
        aria-expanded={!isCollapsed}
        aria-controls="completed-tasks-list"
      >
        <span className="completed-section__icon">
          {isCollapsed ? '▶' : '▼'}
        </span>
        <h3 className="completed-section__title">
          Completed
        </h3>
        <span className="completed-section__count">
          {tasks.length}
        </span>
      </button>

      {!isCollapsed && (
        <div
          id="completed-tasks-list"
          className="completed-section__list"
          role="list"
          aria-label="Completed tasks"
        >
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              variant="completed"
              isDragDisabled
              showPriorityBadge={false}
              showDueDate={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CompletedSection;
