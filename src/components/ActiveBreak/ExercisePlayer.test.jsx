import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExercisePlayer from './ExercisePlayer'

vi.mock('lottie-react', () => ({
  default: () => <div data-testid="lottie-animation" />,
}))

vi.mock('./BreathingCoolDown', () => ({
  default: () => <div data-testid="breathing-cooldown" />,
}))

const mockExercise = {
  id: 'shoulder-rolls',
  name: 'Shoulder Rolls',
  category: 'Light',
  targetType: 'duration',
  targetValue: 30,
  animationFile: {},
  instructions: ['Sit or stand tall', 'Roll shoulders forward'],
  coolDownRequired: false,
  coolDownPattern: null,
}

describe('ExercisePlayer', () => {
  it('renders exercise name', () => {
    render(<ExercisePlayer exercise={mockExercise} onComplete={() => {}} onSkip={() => {}} />)
    expect(screen.getByText('Shoulder Rolls')).toBeInTheDocument()
  })

  it('renders Skip button', () => {
    render(<ExercisePlayer exercise={mockExercise} onComplete={() => {}} onSkip={() => {}} />)
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument()
  })

  it('calls onSkip when Skip clicked', async () => {
    const handleSkip = vi.fn()
    render(<ExercisePlayer exercise={mockExercise} onComplete={() => {}} onSkip={handleSkip} />)
    await userEvent.click(screen.getByRole('button', { name: /skip/i }))
    expect(handleSkip).toHaveBeenCalledOnce()
  })
})
