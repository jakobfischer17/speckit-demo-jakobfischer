import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExerciseCard from './ExerciseCard'

const mockExercise = {
  id: 'push-ups',
  name: 'Push-ups',
  category: 'Intense',
  targetType: 'reps',
  targetValue: 10,
}

describe('ExerciseCard', () => {
  it('renders exercise name', () => {
    render(<ExerciseCard exercise={mockExercise} completed={false} onClick={() => {}} />)
    expect(screen.getByText('Push-ups')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<ExerciseCard exercise={mockExercise} completed={false} onClick={() => {}} />)
    expect(screen.getByText('Intense')).toBeInTheDocument()
  })

  it('renders completed badge when completed=true', () => {
    render(<ExerciseCard exercise={mockExercise} completed={true} onClick={() => {}} />)
    expect(screen.getByLabelText('Completed')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<ExerciseCard exercise={mockExercise} completed={false} onClick={handleClick} />)
    await userEvent.click(screen.getByText('Push-ups'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
