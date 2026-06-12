import { useState, useCallback } from 'react'
import './App.css'
import PomodoroTimer from './components/PomodoroTimer'
import ProductivityTips from './components/ProductivityTips'
import BreathingExercise from './components/BreathingExercise'
import AudioPlayer from './components/AudioPlayer/AudioPlayer'
import Statistics from './components/Statistics/Statistics'
import DailyPlanner from './components/DailyPlanner/DailyPlanner'
import PrioritizationTools from './components/PrioritizationTools/PrioritizationTools'
import SectionNav from './components/Navigation/SectionNav'
import Confetti from './components/Rewards/Confetti'
import AchievementToast from './components/Rewards/AchievementToast'
import { useScrollSpy } from './hooks/useScrollSpy'
import { usePreferences } from './hooks/usePreferences'

// Section configuration
const SECTIONS = [
  { id: 'today', label: 'Today', icon: '📅' },
  { id: 'prioritize', label: 'Prioritize', icon: '🎯' },
  { id: 'timer', label: 'Timer', icon: '🍅' },
  { id: 'audio', label: 'Audio', icon: '🎵' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'breathing', label: 'Breathing', icon: '🧘' },
  { id: 'tips', label: 'Tips', icon: '💡' },
]

// Extract section IDs for scroll spy
const SECTION_IDS = SECTIONS.map(s => s.id)

function App() {
  const { activeSection, scrollToSection } = useScrollSpy(SECTION_IDS)
  const { preferences, toggleTheme } = usePreferences()
  const [celebration, setCelebration] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Handle milestone unlock from PomodoroTimer
  const handleMilestoneUnlocked = useCallback((milestone) => {
    setCelebration(milestone)
    setShowConfetti(true)
  }, [])

  // Handle confetti animation complete
  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false)
  }, [])

  // Handle toast dismiss
  const handleToastDismiss = useCallback(() => {
    setCelebration(null)
  }, [])

  return (
    <div className="app" data-testid="app">
      <a href="#today" className="skip-link">Skip to main content</a>
      <header className="app-header">
        <h1 className="app-title">🚀 Productivity Hub</h1>
        <p className="app-subtitle">Boost your focus and well-being</p>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-pressed={preferences.theme === 'dark'}
          aria-label={`Switch to ${preferences.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {preferences.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <SectionNav
        sections={SECTIONS}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      <main className="main-content" id="main-content">
        <section id="today" className="content-section" aria-label="Today's plan">
          <DailyPlanner />
        </section>

        <section id="prioritize" className="content-section" aria-label="Prioritization tools">
          <PrioritizationTools />
        </section>

        <section id="timer" className="content-section" aria-label="Pomodoro timer">
          <PomodoroTimer
            onMilestoneUnlocked={handleMilestoneUnlocked}
            preferences={preferences}
          />
        </section>

        <section id="audio" className="content-section" aria-label="Focus audio">
          <AudioPlayer />
        </section>

        <section id="stats" className="content-section" aria-label="Focus statistics">
          <Statistics />
        </section>

        <section id="breathing" className="content-section" aria-label="Breathing exercise">
          <BreathingExercise />
        </section>

        <section id="tips" className="content-section" aria-label="Productivity tips">
          <ProductivityTips />
        </section>
      </main>

      <footer className="app-footer">
        <p>Built with React • Focus Enhancement Suite</p>
      </footer>

      {/* Global celebration overlays */}
      <Confetti
        active={showConfetti}
        duration={4000}
        particleCount={150}
        onComplete={handleConfettiComplete}
      />
      <AchievementToast
        achievement={celebration}
        visible={celebration !== null}
        onDismiss={handleToastDismiss}
        autoDismissDelay={5000}
      />
    </div>
  )
}

export default App
