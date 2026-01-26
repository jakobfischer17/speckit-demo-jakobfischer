import { useState, useCallback } from 'react'
import './App.css'
import PomodoroTimer from './components/PomodoroTimer'
import ProductivityTips from './components/ProductivityTips'
import BreathingExercise from './components/BreathingExercise'
import AudioPlayer from './components/AudioPlayer/AudioPlayer'
import Statistics from './components/Statistics/Statistics'
import SectionNav from './components/Navigation/SectionNav'
import Confetti from './components/Rewards/Confetti'
import AchievementToast from './components/Rewards/AchievementToast'
import { useScrollSpy } from './hooks/useScrollSpy'

// Section configuration
const SECTIONS = [
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
      <header className="app-header">
        <h1 className="app-title">🚀 Productivity Hub</h1>
        <p className="app-subtitle">Boost your focus and well-being</p>
      </header>

      <SectionNav
        sections={SECTIONS}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      <main className="main-content">
        <section id="timer" className="content-section">
          <PomodoroTimer onMilestoneUnlocked={handleMilestoneUnlocked} />
        </section>

        <section id="audio" className="content-section">
          <AudioPlayer />
        </section>

        <section id="stats" className="content-section">
          <Statistics />
        </section>

        <section id="breathing" className="content-section">
          <BreathingExercise />
        </section>

        <section id="tips" className="content-section">
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
