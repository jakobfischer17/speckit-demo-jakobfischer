import { useState, useCallback } from 'react';
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/**
 * useDragAndDrop - dnd-kit wrapper with keyboard support
 * Provides sensors and handlers for drag-and-drop functionality
 */
export function useDragAndDrop({ onReorder, disabled = false }) {
  const [activeId, setActiveId] = useState(null);

  // Configure sensors for pointer and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require pointer to move 8px before activating drag
        // This prevents accidental drags on click
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    if (disabled) return;
    setActiveId(event.active.id);
  }, [disabled]);

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);

    if (disabled) return;
    if (!over) return;
    if (active.id === over.id) return;

    // Call the reorder callback
    if (onReorder) {
      onReorder(active.id, over.id);
    }
  }, [disabled, onReorder]);

  // Handle drag cancel (e.g., pressing Escape)
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return {
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}

export default useDragAndDrop;
