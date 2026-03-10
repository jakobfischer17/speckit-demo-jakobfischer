import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BreathingExercise from './BreathingExercise';

describe('BreathingExercise', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a box guide by default and moves the dot when the exercise starts', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<BreathingExercise />);

    expect(screen.getByTestId('box-breathing-visual')).toBeInTheDocument();

    const boxDot = screen.getByTestId('box-breathing-dot');
    const initialLeft = boxDot.style.left;

    await user.click(screen.getByRole('button', { name: 'Start' }));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(boxDot.style.left).not.toBe(initialLeft);
    expect(screen.getByTestId('breathing-countdown')).toHaveTextContent('2');
  });

  it('switches to exercise-specific visuals for relaxation and energizing modes', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<BreathingExercise />);

    await user.click(screen.getByRole('button', { name: '4-7-8 Breathing' }));
    expect(screen.getByTestId('relax-breathing-visual')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Energizing Breath' }));
    expect(screen.getByTestId('energizing-breath-visual')).toBeInTheDocument();
  });
});
