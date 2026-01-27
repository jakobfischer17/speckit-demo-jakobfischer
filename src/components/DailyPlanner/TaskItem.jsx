import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isToday, isPast, startOfDay } from 'date-fns';
import './TaskItem.css';

/**
 * TaskItem - Individual task row with checkbox, title, actions
 * Supports inline editing, completion animation, and drag-and-drop
 */
function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  variant = 'default',
  isDragging = false,
  isDragDisabled = false,
  showPriorityBadge = false,
  showDueDate = false,
  showRiceScore = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef(null);

  // Sortable hook for drag-and-drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragDisabled || isEditing || task.completedAt,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle completion with animation
  const handleToggleComplete = () => {
    if (isEditing) return;
    setIsCompleting(true);
    // Delay actual toggle to show animation
    setTimeout(() => {
      onToggleComplete();
      setIsCompleting(false);
    }, 200);
  };

  // Handle edit start
  const handleEditStart = () => {
    if (task.completedAt) return;
    setEditValue(task.title);
    setIsEditing(true);
  };

  // Handle edit save
  const handleEditSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      onEdit(trimmed);
    }
    setIsEditing(false);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditValue(task.title);
    setIsEditing(false);
  };

  // Handle key events in edit mode
  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  };

  // Format due date
  const formatDueDate = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    if (isToday(date)) return 'Today';
    return format(date, 'MMM d');
  };

  // Check if overdue
  const isOverdue = task.dueDate && isPast(startOfDay(new Date(task.dueDate))) && !isToday(new Date(task.dueDate)) && !task.completedAt;

  // Build class names
  const classNames = [
    'task-item',
    `task-item--${variant}`,
    isDragging || isSortableDragging ? 'task-item--dragging' : '',
    task.completedAt ? 'task-item--completed' : '',
    isCompleting ? 'task-item--completing' : '',
    task.priority === 'high' ? 'task-item--high-priority' : '',
    isOverdue ? 'task-item--overdue' : '',
    isEditing ? 'task-item--editing' : '',
  ].filter(Boolean).join(' ');

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={classNames}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Drag handle */}
      {!isDragDisabled && !task.completedAt && (
        <button
          className="task-item__drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          ⋮⋮
        </button>
      )}

      {/* Checkbox */}
      <button
        className="task-item__checkbox"
        onClick={handleToggleComplete}
        aria-label={task.completedAt ? 'Mark as incomplete' : 'Mark as complete'}
        aria-pressed={!!task.completedAt}
      >
        {task.completedAt && <span className="task-item__checkmark">✓</span>}
      </button>

      {/* Title / Edit input */}
      <div className="task-item__content" onClick={!isEditing ? handleEditStart : undefined}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="task-item__edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditSave}
            aria-label="Edit task title"
          />
        ) : (
          <span className="task-item__title">{task.title}</span>
        )}
      </div>

      {/* Metadata badges */}
      <div className="task-item__meta">
        {showPriorityBadge && task.priority !== 'medium' && (
          <span className={`task-item__priority task-item__priority--${task.priority}`}>
            {task.priority === 'high' ? '!' : '↓'}
          </span>
        )}
        {showDueDate && task.dueDate && (
          <span className={`task-item__due-date ${isOverdue ? 'task-item__due-date--overdue' : ''}`}>
            {formatDueDate()}
          </span>
        )}
        {showRiceScore && task.riceScores?.score && (
          <span className="task-item__rice-score">
            {task.riceScores.score.toFixed(1)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className={`task-item__actions ${showActions ? 'task-item__actions--visible' : ''}`}>
        <button
          className="task-item__delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${task.title}`}
        >
          🗑️
        </button>
      </div>
    </li>
  );
}

export default TaskItem;
