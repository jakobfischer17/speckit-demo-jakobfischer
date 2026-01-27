import { useState, useRef, useCallback } from 'react';
import './QuickAdd.css';

/**
 * QuickAdd - Instant task creation with Enter key
 * FR-028: Input + Enter to add task in <200ms
 */
function QuickAdd({
  onAdd,
  placeholder = 'Add a task...',
  autoFocus = false,
  disabled = false,
}) {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = useCallback(async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(trimmedValue);
      setValue('');
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsSubmitting(false);
      // Refocus input after submission
      inputRef.current?.focus();
    }
  }, [value, isSubmitting, onAdd]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setValue('');
      inputRef.current?.blur();
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  return (
    <div className="quick-add">
      <span className="quick-add__icon" aria-hidden="true">+</span>
      <input
        ref={inputRef}
        type="text"
        className="quick-add__input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled || isSubmitting}
        aria-label="New task title"
      />
      {value.trim() && (
        <button
          type="button"
          className="quick-add__submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          aria-label="Add task"
        >
          {isSubmitting ? '...' : '↵'}
        </button>
      )}
    </div>
  );
}

export default QuickAdd;
