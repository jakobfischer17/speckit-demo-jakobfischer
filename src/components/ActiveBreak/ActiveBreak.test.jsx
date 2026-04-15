import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActiveBreak from './ActiveBreak'

vi.mock('lottie-react', () => ({
  default: () => <div data-testid="lottie-animation" />,
}))

describe('ActiveBreak', () => {
  it('renders ExerciseLibrary by default', () => {
    render(<ActiveBreak isBreakActive={false} />)
    expect(screen.getByText('🏃 Active Break Exercises')).toBeInTheDocument()
  })

  it('banner visible when isBreakActive=true', () => {
    render(<ActiveBreak isBreakActive={true} />)
    expect(screen.getByText(/time for an active break/i)).toBeInTheDocument()
  })

  it('banner hidden when isBreakActive=false', () => {
    render(<ActiveBreak isBreakActive={false} />)
    expect(screen.queryByText(/time for an active break/i)).not.toBeInTheDocument()
  })

  it('banner hides after dismiss button clicked', async () => {
    render(<ActiveBreak isBreakActive={true} />)
    await userEvent.click(screen.getByLabelText('Dismiss break banner'))
    expect(screen.queryByText(/time for an active break/i)).not.toBeInTheDocument()
  })

  it('banner reappears on next break', async () => {
    const { rerender } = render(<ActiveBreak isBreakActive={true} />)
    await userEvent.click(screen.getByLabelText('Dismiss break banner'))
    rerender(<ActiveBreak isBreakActive={false} />)
    rerender(<ActiveBreak isBreakActive={true} />)
    expect(screen.getByText(/time for an active break/i)).toBeInTheDocument()
  })
})
