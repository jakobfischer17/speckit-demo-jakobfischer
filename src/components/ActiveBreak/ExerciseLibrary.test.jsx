import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExerciseLibrary from './ExerciseLibrary'

const mockExercises = [
  { id: 'push-ups', name: 'Push-ups', category: 'Intense', targetType: 'reps', targetValue: 10 },
  { id: 'shoulder-rolls', name: 'Shoulder Rolls', category: 'Light', targetType: 'duration', targetValue: 30 },
  { id: 'forward-fold', name: 'Forward Fold', category: 'Stretch', targetType: 'duration', targetValue: 30 },
]

describe('ExerciseLibrary', () => {
  it('renders all exercises by default', () => {
    render(
      <ExerciseLibrary exercises={mockExercises} completedIds={[]} onSelectExercise={() => {}} onResetCompleted={() => {}} />
    )
    expect(screen.getByText('Push-ups')).toBeInTheDocument()
    expect(screen.getByText('Shoulder Rolls')).toBeInTheDocument()
    expect(screen.getByText('Forward Fold')).toBeInTheDocument()
  })

  it('renders only Stretch exercises when Stretch filter active', async () => {
    render(
      <ExerciseLibrary exercises={mockExercises} completedIds={[]} onSelectExercise={() => {}} onResetCompleted={() => {}} />
    )
    await userEvent.click(screen.getByRole('button', { name: /filter by stretch/i }))
    expect(screen.getByText('Forward Fold')).toBeInTheDocument()
    expect(screen.queryByText('Push-ups')).not.toBeInTheDocument()
  })

  it('renders only Intense exercises when Intense filter active', async () => {
    render(
      <ExerciseLibrary exercises={mockExercises} completedIds={[]} onSelectExercise={() => {}} onResetCompleted={() => {}} />
    )
    await userEvent.click(screen.getByRole('button', { name: /filter by intense/i }))
    expect(screen.getByText('Push-ups')).toBeInTheDocument()
    expect(screen.queryByText('Shoulder Rolls')).not.toBeInTheDocument()
  })

  it('shows empty-state when filtered result is empty', async () => {
    render(
      <ExerciseLibrary exercises={[mockExercises[0]]} completedIds={[]} onSelectExercise={() => {}} onResetCompleted={() => {}} />
    )
    await userEvent.click(screen.getByRole('button', { name: /filter by stretch/i }))
    expect(screen.getByText('No exercises found for this category.')).toBeInTheDocument()
  })

  it('calls onSelectExercise with correct exercise when card clicked', async () => {
    const handleSelect = vi.fn()
    render(
      <ExerciseLibrary exercises={mockExercises} completedIds={[]} onSelectExercise={handleSelect} onResetCompleted={() => {}} />
    )
    await userEvent.click(screen.getByText('Push-ups'))
    expect(handleSelect).toHaveBeenCalledWith(mockExercises[0])
  })

  it('shows congratulations when all filtered exercises completed', () => {
    render(
      <ExerciseLibrary
        exercises={mockExercises}
        completedIds={['push-ups', 'shoulder-rolls', 'forward-fold']}
        onSelectExercise={() => {}}
        onResetCompleted={() => {}}
      />
    )
    expect(screen.getByText(/congratulations/i)).toBeInTheDocument()
  })

  it('calls onResetCompleted when Reset button clicked', async () => {
    const handleReset = vi.fn()
    render(
      <ExerciseLibrary
        exercises={mockExercises}
        completedIds={['push-ups', 'shoulder-rolls', 'forward-fold']}
        onSelectExercise={() => {}}
        onResetCompleted={handleReset}
      />
    )
    await userEvent.click(screen.getByText(/reset/i))
    expect(handleReset).toHaveBeenCalledWith('All')
  })
})
