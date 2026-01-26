import { useState } from 'react'
import './App.css'
import PomodoroTimer from './components/PomodoroTimer'
import ProductivityTips from './components/ProductivityTips'
import BreathingExercise from './components/BreathingExercise'

function App() {
  const [activeTab, setActiveTab] = useState('pomodoro')

  const renderContent = () => {
    switch (activeTab) {
      case 'pomodoro':
        return <PomodoroTimer />
      case 'tips':
        return <ProductivityTips />
      case 'breathing':
        return <BreathingExercise />
      default:
        return <PomodoroTimer />
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🚀 Productivity Hub</h1>
        <p className="app-subtitle">Boost your focus and well-being</p>
      </header>

      <nav className="navigation">
        <button
          className={`nav-button ${activeTab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => setActiveTab('pomodoro')}
        >
          🍅 Pomodoro Timer
        </button>
        <button
          className={`nav-button ${activeTab === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveTab('tips')}
        >
          💡 Productivity Tips
        </button>
        <button
          className={`nav-button ${activeTab === 'breathing' ? 'active' : ''}`}
          onClick={() => setActiveTab('breathing')}
        >
          🧘 Breathing Exercise
        </button>
      </nav>

      <main className="content">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>Built with React • Ready for SpecKit enhancement</p>
      </footer>
    </div>
  )
}

export default App
