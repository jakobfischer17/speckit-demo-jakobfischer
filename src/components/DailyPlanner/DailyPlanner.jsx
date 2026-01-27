import './DailyPlanner.css';
import { useTasks } from '../../hooks/useTasks';
import { useTaskSort } from '../../hooks/useTaskSort';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useTop3Focus } from '../../hooks/useTop3Focus';
import TodayView from './TodayView';
import TaskList from './TaskList';
import CompletedSection from './CompletedSection';
import SortControls from './SortControls';
import UndoToast from './UndoToast';

/**
 * DailyPlanner - Root component for the daily planner section
 * Self-contained section with task management, sorting, and drag-and-drop
 */
function DailyPlanner() {
  const {
    tasks,
    completedTasks,
    isLoading,
    error,
    pendingDelete,
    createTask,
    updateTask,
    deleteTask,
    undoDelete,
    toggleComplete,
    reorderTasks,
  } = useTasks();

  const {
    sortBy,
    sortDirection,
    isManualOrder,
    sortLabel,
    setSortBy,
    toggleDirection,
    clearSort,
    sortedTasks,
  } = useTaskSort();

  const {
    top3,
    isGenerating,
    generatedAt,
    generate: generateTop3,
    dismiss: dismissTop3,
  } = useTop3Focus(tasks);

  const {
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop({
    onReorder: reorderTasks,
    disabled: !isManualOrder, // Disable drag when auto-sort is active
  });

  // Apply sorting to tasks
  const displayTasks = sortedTasks(tasks);

  // Handle quick add
  const handleQuickAdd = async (title) => {
    if (!title.trim()) return;
    await createTask(title.trim());
  };

  // Handle task edit
  const handleEditTask = async (id, newTitle) => {
    if (!newTitle.trim()) return;
    await updateTask(id, { title: newTitle.trim() });
  };

  // Handle sort change with confirmation for manual order
  const handleSortChange = (option) => {
    if (isManualOrder && option !== 'manual') {
      // Could show confirmation modal here
      setSortBy(option);
    } else {
      setSortBy(option);
    }
  };

  if (error) {
    return (
      <div className="daily-planner daily-planner--error">
        <p>Failed to load tasks. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="daily-planner">
      <TodayView
        tasks={displayTasks}
        top3={generatedAt ? top3 : []}
        onQuickAdd={handleQuickAdd}
        onGenerateTop3={generateTop3}
        onDismissTop3={dismissTop3}
        isGeneratingTop3={isGenerating}
      />

      <div className="daily-planner__controls">
        <SortControls
          currentSort={sortBy}
          direction={sortDirection}
          hasManualOrder={isManualOrder}
          onSortChange={handleSortChange}
          onDirectionToggle={toggleDirection}
          onClearSort={clearSort}
        />
      </div>

      <TaskList
        tasks={displayTasks}
        onToggleComplete={toggleComplete}
        onDelete={deleteTask}
        onEdit={handleEditTask}
        onReorder={reorderTasks}
        isLoading={isLoading}
        sensors={sensors}
        activeId={activeId}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        isDragDisabled={!isManualOrder}
      />

      {completedTasks.length > 0 && (
        <CompletedSection
          tasks={completedTasks}
          onToggleComplete={toggleComplete}
          onDelete={deleteTask}
        />
      )}

      <UndoToast
        pendingDelete={pendingDelete}
        onUndo={undoDelete}
      />
    </div>
  );
}

export default DailyPlanner;
