import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import StreakTracker from './StreakTracker';

describe('StreakTracker', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows an empty state before any goals are added', () => {
    render(<StreakTracker />);
    expect(screen.getByText(/No goals yet/i)).toBeInTheDocument();
  });

  it('creates a custom goal and checks it off today', () => {
    render(<StreakTracker />);

    fireEvent.change(screen.getByLabelText(/New goal name/i), {
      target: { value: 'Read 30 min' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add goal/i }));

    const card = screen.getByLabelText('Goal: Read 30 min');
    expect(card).toBeInTheDocument();

    const checkButton = within(card).getByRole('button', { name: /Mark done today/i });
    fireEvent.click(checkButton);

    expect(within(card).getByRole('button', { name: /Done today/i })).toBeInTheDocument();
    // Streak should now read 1 day.
    expect(within(card).getByText('1')).toBeInTheDocument();
  });

  it('deletes a goal', () => {
    render(<StreakTracker />);
    fireEvent.change(screen.getByLabelText(/New goal name/i), {
      target: { value: 'Exercise' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add goal/i }));

    const card = screen.getByLabelText('Goal: Exercise');
    fireEvent.click(within(card).getByRole('button', { name: /Delete goal Exercise/i }));

    expect(screen.queryByLabelText('Goal: Exercise')).not.toBeInTheDocument();
    expect(screen.getByText(/No goals yet/i)).toBeInTheDocument();
  });
});
