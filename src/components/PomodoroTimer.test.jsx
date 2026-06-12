import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import PomodoroTimer from './PomodoroTimer'

const statsServiceMocks = vi.hoisted(() => ({
  recordSession: vi.fn(),
  recordBreakReminderAction: vi.fn(),
}))

const milestoneMocks = vi.hoisted(() => ({
  checkMilestones: vi.fn(),
  getCelebrationMessage: vi.fn(() => ({ title: '', subtitle: '' })),
}))

vi.mock('../services/statsService', () => ({
  recordSession: statsServiceMocks.recordSession,
  recordBreakReminderAction: statsServiceMocks.recordBreakReminderAction,
}))

vi.mock('../hooks/useMilestones', () => ({
  useMilestones: () => ({
    checkMilestones: milestoneMocks.checkMilestones,
    getCelebrationMessage: milestoneMocks.getCelebrationMessage,
  }),
}))

describe('PomodoroTimer break reminders', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    statsServiceMocks.recordSession.mockResolvedValue({})
    statsServiceMocks.recordBreakReminderAction.mockResolvedValue({})
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  async function completeWorkSession() {
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /^set$/i }))
    fireEvent.click(screen.getByRole('button', { name: /start/i }))

    for (let second = 0; second < 62; second += 1) {
      act(() => {
        vi.advanceTimersToNextTimer()
      })
    }

    await act(async () => {
      await Promise.resolve()
    })
  }

  it('shows break reminder when a work session completes', async () => {
    render(<PomodoroTimer />)

    await completeWorkSession()

    expect(screen.getByText(/work session complete\. ready for a break\?/i)).toBeInTheDocument()
  })

  it('supports skip break and records analytics action', async () => {
    render(<PomodoroTimer />)

    await completeWorkSession()
    fireEvent.click(screen.getByRole('button', { name: /skip break/i }))

    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.queryByText(/work session complete\. ready for a break\?/i)).not.toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(statsServiceMocks.recordBreakReminderAction).toHaveBeenCalledWith({
      action: 'skip',
      mode: 'work',
    })
  })

  it('supports snooze 5 min and re-shows reminder after delay', async () => {
    render(<PomodoroTimer />)

    await completeWorkSession()
    fireEvent.click(screen.getByRole('button', { name: /snooze 5 min/i }))

    expect(statsServiceMocks.recordBreakReminderAction).toHaveBeenCalledWith({
      action: 'snooze',
      mode: 'work',
    })
    expect(screen.queryByText(/work session complete\. ready for a break\?/i)).not.toBeInTheDocument()
    expect(screen.getByText(/break reminder snoozed for 5 minutes/i)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(299_000)
    })
    expect(screen.queryByText(/work session complete\. ready for a break\?/i)).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1_000)
    })
    expect(screen.getByText(/work session complete\. ready for a break\?/i)).toBeInTheDocument()
  })
})
