import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import DailyPlanner from './DailyPlanner';

describe('DailyPlanner', () => {
  it('creates, edits, deletes, and restores a task through the planner UI', async () => {
    const user = userEvent.setup();

    render(<DailyPlanner />);

    const quickAddInput = screen.getByLabelText(/new task title/i);
    await user.type(quickAddInput, 'Plan sprint review{enter}');

    const taskTitle = await screen.findByText('Plan sprint review');
    await user.click(taskTitle);

    const editInput = await screen.findByLabelText(/edit task title/i);
    await user.clear(editInput);
    await user.type(editInput, 'Plan launch review{enter}');

    const renamedTask = await screen.findByText('Plan launch review');
    const taskItem = renamedTask.closest('li');

    fireEvent.mouseEnter(taskItem);
    await user.click(within(taskItem).getByRole('button', { name: /delete plan launch review/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Plan launch review');

    await user.click(screen.getByRole('button', { name: /undo/i }));

    await waitFor(() => {
      expect(screen.getByText('Plan launch review')).toBeInTheDocument();
    });
  });

  it('moves completed tasks into the completed section', async () => {
    const user = userEvent.setup();

    render(<DailyPlanner />);

    const quickAddInput = screen.getByLabelText(/new task title/i);
    await user.type(quickAddInput, 'Ship status update{enter}');

    await screen.findByText('Ship status update');
    await user.click(screen.getByRole('button', { name: /mark as complete/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
      expect(screen.getByText('Ship status update')).toBeInTheDocument();
    });
  });
});
