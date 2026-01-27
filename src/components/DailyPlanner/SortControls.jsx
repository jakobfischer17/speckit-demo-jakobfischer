import { useCallback } from 'react';
import './SortControls.css';

/**
 * SortControls - Sorting options dropdown with direction toggle
 * FR-036: Sort by priority, due date, creation time, or RICE score
 */

const SORT_OPTIONS = [
  { value: 'manual', label: 'Manual Order', icon: '✋' },
  { value: 'priority', label: 'Priority', icon: '⬆️' },
  { value: 'dueDate', label: 'Due Date', icon: '📅' },
  { value: 'createdAt', label: 'Created', icon: '🕐' },
  { value: 'rice', label: 'RICE Score', icon: '📊' },
];

function SortControls({
  currentSort = 'manual',
  direction = 'asc',
  hasManualOrder = true,
  onSortChange,
  onDirectionToggle,
  onClearSort,
}) {
  const currentOption = SORT_OPTIONS.find((opt) => opt.value === currentSort) || SORT_OPTIONS[0];
  const isManual = currentSort === 'manual';

  const handleSortChange = useCallback((e) => {
    onSortChange?.(e.target.value);
  }, [onSortChange]);

  const handleDirectionClick = useCallback(() => {
    onDirectionToggle?.();
  }, [onDirectionToggle]);

  const handleClearClick = useCallback(() => {
    onClearSort?.();
  }, [onClearSort]);

  return (
    <div className="sort-controls">
      <label className="sort-controls__label" htmlFor="sort-select">
        Sort by:
      </label>
      
      <div className="sort-controls__select-wrapper">
        <span className="sort-controls__icon">{currentOption.icon}</span>
        <select
          id="sort-select"
          className="sort-controls__select"
          value={currentSort}
          onChange={handleSortChange}
          aria-label="Sort tasks by"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Direction toggle (hidden for manual order) */}
      {!isManual && (
        <button
          type="button"
          className="sort-controls__direction"
          onClick={handleDirectionClick}
          aria-label={direction === 'asc' ? 'Sort ascending' : 'Sort descending'}
          title={direction === 'asc' ? 'Ascending' : 'Descending'}
        >
          {direction === 'asc' ? '↑' : '↓'}
        </button>
      )}

      {/* Clear sort button (shown when not manual) */}
      {!isManual && (
        <button
          type="button"
          className="sort-controls__clear"
          onClick={handleClearClick}
          aria-label="Clear sort and return to manual order"
          title="Return to manual order"
        >
          ✕
        </button>
      )}

      {/* Manual order indicator */}
      {isManual && hasManualOrder && (
        <span className="sort-controls__indicator" title="Drag tasks to reorder">
          Drag to reorder
        </span>
      )}
    </div>
  );
}

export default SortControls;
