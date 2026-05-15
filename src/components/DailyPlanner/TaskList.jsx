import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './TaskList.css';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskItem from './TaskItem';

// Virtualization threshold per SC-002
const VIRTUALIZATION_THRESHOLD = 50;
const ESTIMATED_ITEM_HEIGHT = 52;

/**
 * TaskList - Virtualization-ready list container with drag-and-drop support
 * Enables virtualization when task count > 50 for 60fps scroll performance
 */
function TaskList({
  tasks = [],
  onToggleComplete,
  onDelete,
  onEdit,
  onReorder,
  isLoading = false,
  sensors,
  activeId,
  onDragStart,
  onDragEnd,
  onDragCancel,
  isDragDisabled = false,
}) {
  const parentRef = useRef(null);
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;
  
  // Determine if virtualization should be enabled
  const shouldVirtualize = tasks.length > VIRTUALIZATION_THRESHOLD;

  // Configure virtualizer (only active when needed)
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_ITEM_HEIGHT,
    overscan: 5,
    enabled: shouldVirtualize,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (isLoading) {
    return (
      <div className="task-list task-list--loading">
        <div className="task-list__skeleton" />
        <div className="task-list__skeleton" />
        <div className="task-list__skeleton" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return null; // Empty state handled by TodayView
  }

  const taskIds = tasks.map((t) => t.id);

  // Virtualized list rendering
  if (shouldVirtualize) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div
            ref={parentRef}
            className="task-list task-list--virtualized"
            role="list"
            aria-label="Tasks"
            style={{ height: '400px', overflow: 'auto' }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualItems.map((virtualRow) => {
                const task = tasks[virtualRow.index];
                return (
                  <div
                    key={task.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <TaskItem
                      task={task}
                      onToggleComplete={() => onToggleComplete(task.id)}
                      onDelete={() => onDelete(task.id)}
                      onEdit={(newTitle) => onEdit(task.id, newTitle)}
                      isDragging={activeId === task.id}
                      isDragDisabled={isDragDisabled}
                      showPriorityBadge
                      showDueDate
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </SortableContext>

        <DragOverlay>
          {activeTask ? (
            <TaskItem
              task={activeTask}
              onToggleComplete={() => {}}
              onDelete={() => {}}
              onEdit={() => {}}
              isDragging
              variant="dragging"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  // Standard (non-virtualized) rendering for smaller lists
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <ul className="task-list" role="list" aria-label="Tasks">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={() => onToggleComplete(task.id)}
              onDelete={() => onDelete(task.id)}
              onEdit={(newTitle) => onEdit(task.id, newTitle)}
              isDragging={activeId === task.id}
              isDragDisabled={isDragDisabled}
              showPriorityBadge
              showDueDate
            />
          ))}
        </ul>
      </SortableContext>

      {/* Drag overlay for smooth dragging */}
      <DragOverlay>
        {activeTask ? (
          <TaskItem
            task={activeTask}
            onToggleComplete={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            isDragging
            variant="dragging"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TaskList;
