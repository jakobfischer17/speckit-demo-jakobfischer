import { useCallback, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import './EisenhowerMatrix.css';
import {
  EISENHOWER_QUADRANTS,
  QUADRANT_INFO,
  getPriorityFromQuadrant,
} from '../../data/priorityConfig';

/**
 * EisenhowerMatrix - 2x2 matrix for task prioritization
 * FR-035: Visual matrix view with drag-drop between quadrants
 */
function EisenhowerMatrix({ tasks = [], onQuadrantAssign }) {
  const [activeId, setActiveId] = useState(null);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  // Group tasks by quadrant
  const tasksByQuadrant = {
    [EISENHOWER_QUADRANTS.DO_FIRST]: tasks.filter(
      (t) => t.eisenhowerQuadrant === EISENHOWER_QUADRANTS.DO_FIRST
    ),
    [EISENHOWER_QUADRANTS.SCHEDULE]: tasks.filter(
      (t) => t.eisenhowerQuadrant === EISENHOWER_QUADRANTS.SCHEDULE
    ),
    [EISENHOWER_QUADRANTS.DELEGATE]: tasks.filter(
      (t) => t.eisenhowerQuadrant === EISENHOWER_QUADRANTS.DELEGATE
    ),
    [EISENHOWER_QUADRANTS.ELIMINATE]: tasks.filter(
      (t) => t.eisenhowerQuadrant === EISENHOWER_QUADRANTS.ELIMINATE
    ),
  };

  // Unassigned tasks (staging area)
  const unassignedTasks = tasks.filter((t) => !t.eisenhowerQuadrant);

  // Get active task for drag overlay
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const taskId = active.id;
      const targetQuadrant = over.id;

      // Check if dropping on a valid quadrant
      if (Object.values(EISENHOWER_QUADRANTS).includes(targetQuadrant)) {
        const newPriority = getPriorityFromQuadrant(targetQuadrant);
        onQuadrantAssign?.(taskId, targetQuadrant, newPriority);
      } else if (targetQuadrant === 'staging') {
        // Move back to unassigned
        onQuadrantAssign?.(taskId, null, 'medium');
      }
    },
    [onQuadrantAssign]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <div className="eisenhower-matrix">
      <h3 className="eisenhower-matrix__title">Eisenhower Matrix</h3>
      <p className="eisenhower-matrix__description">
        Drag tasks to categorize by urgency and importance
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {/* Staging area for unassigned tasks */}
        <div className="eisenhower-matrix__staging">
          <h4 className="eisenhower-matrix__staging-title">
            Unassigned Tasks ({unassignedTasks.length})
          </h4>
          <Quadrant
            id="staging"
            tasks={unassignedTasks}
            activeId={activeId}
            isStaging
          />
        </div>

        {/* 2x2 Matrix */}
        <div className="eisenhower-matrix__grid">
          {/* Column headers */}
          <div className="eisenhower-matrix__header eisenhower-matrix__header--urgent">
            Urgent
          </div>
          <div className="eisenhower-matrix__header eisenhower-matrix__header--not-urgent">
            Not Urgent
          </div>

          {/* Row labels */}
          <div className="eisenhower-matrix__row-label eisenhower-matrix__row-label--important">
            Important
          </div>
          <div className="eisenhower-matrix__row-label eisenhower-matrix__row-label--not-important">
            Not Important
          </div>

          {/* Quadrants */}
          <Quadrant
            id={EISENHOWER_QUADRANTS.DO_FIRST}
            tasks={tasksByQuadrant[EISENHOWER_QUADRANTS.DO_FIRST]}
            info={QUADRANT_INFO[EISENHOWER_QUADRANTS.DO_FIRST]}
            activeId={activeId}
          />
          <Quadrant
            id={EISENHOWER_QUADRANTS.SCHEDULE}
            tasks={tasksByQuadrant[EISENHOWER_QUADRANTS.SCHEDULE]}
            info={QUADRANT_INFO[EISENHOWER_QUADRANTS.SCHEDULE]}
            activeId={activeId}
          />
          <Quadrant
            id={EISENHOWER_QUADRANTS.DELEGATE}
            tasks={tasksByQuadrant[EISENHOWER_QUADRANTS.DELEGATE]}
            info={QUADRANT_INFO[EISENHOWER_QUADRANTS.DELEGATE]}
            activeId={activeId}
          />
          <Quadrant
            id={EISENHOWER_QUADRANTS.ELIMINATE}
            tasks={tasksByQuadrant[EISENHOWER_QUADRANTS.ELIMINATE]}
            info={QUADRANT_INFO[EISENHOWER_QUADRANTS.ELIMINATE]}
            activeId={activeId}
          />
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTask && (
            <div className="eisenhower-matrix__task eisenhower-matrix__task--dragging">
              {activeTask.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/**
 * Quadrant - Droppable zone for a quadrant
 */
function Quadrant({ id, tasks, info, activeId, isStaging = false }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`eisenhower-matrix__quadrant ${
        isStaging ? 'eisenhower-matrix__quadrant--staging' : ''
      } ${isOver ? 'eisenhower-matrix__quadrant--over' : ''}`}
      data-quadrant={id}
    >
      {info && (
        <div className="eisenhower-matrix__quadrant-header">
          <span className="eisenhower-matrix__quadrant-label">{info.label}</span>
          <span className="eisenhower-matrix__quadrant-desc">{info.description}</span>
        </div>
      )}
      <div className="eisenhower-matrix__quadrant-tasks">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} isDragging={task.id === activeId} />
        ))}
        {tasks.length === 0 && !isStaging && (
          <div className="eisenhower-matrix__empty">Drop tasks here</div>
        )}
      </div>
    </div>
  );
}

/**
 * TaskCard - Draggable task card
 */
function TaskCard({ task, isDragging }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className={`eisenhower-matrix__task ${isDragging ? 'eisenhower-matrix__task--dragging' : ''}`}
      style={style}
      {...listeners}
      {...attributes}
    >
      <span className="eisenhower-matrix__task-title">{task.title}</span>
      {task.priority && (
        <span
          className={`eisenhower-matrix__task-priority eisenhower-matrix__task-priority--${task.priority}`}
        >
          {task.priority.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default EisenhowerMatrix;
