import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BreathingExercise from './BreathingExercise';

describe('BreathingExercise', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a box guide by default and moves the dot when the exercise starts', () => {
    render(<BreathingExercise />);

    expect(screen.getByTestId('box-breathing-visual')).toBeInTheDocument();

    const boxDot = screen.getByTestId('box-breathing-dot');
    expect(boxDot.className).not.toContain('breathing-box__dot--active');

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(boxDot.className).toContain('breathing-box__dot--active');
    expect(boxDot.style.getPropertyValue('--box-cycle')).toBe('16s');
    expect(screen.getByTestId('breathing-countdown')).toHaveTextContent('2');
  });

  it('switches to exercise-specific visuals for relaxation and energizing modes', () => {
    render(<BreathingExercise />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: '4-7-8 Breathing' }));
    });
    expect(screen.getByTestId('relax-breathing-visual')).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Energizing Breath' }));
    });
    expect(screen.getByTestId('energizing-breath-visual')).toBeInTheDocument();
  });
});
