import { useState } from 'react';
import './ProductivityTips.css';

function ProductivityTips() {
  const tips = [
    {
      title: "Use the Pomodoro Technique",
      description: "Work in 25-minute focused sessions with 5-minute breaks. After 4 sessions, take a longer 15-30 minute break.",
      icon: "🍅"
    },
    {
      title: "Start with the Hardest Task",
      description: "Tackle your most challenging task first thing in the morning when your energy is highest.",
      icon: "🎯"
    },
    {
      title: "Minimize Distractions",
      description: "Turn off notifications, close unnecessary tabs, and create a dedicated workspace.",
      icon: "🔕"
    },
    {
      title: "Take Regular Breaks",
      description: "Short breaks help maintain focus and prevent burnout. Stand up, stretch, or take a brief walk.",
      icon: "🚶"
    },
    {
      title: "Use the Two-Minute Rule",
      description: "If something takes less than two minutes, do it immediately instead of adding it to your to-do list.",
      icon: "⏱️"
    },
    {
      title: "Practice Single-Tasking",
      description: "Focus on one task at a time. Multitasking reduces productivity and increases errors.",
      icon: "✨"
    },
    {
      title: "Set Clear Goals",
      description: "Define specific, measurable goals for each work session to stay focused and motivated.",
      icon: "🎪"
    },
    {
      title: "Stay Hydrated",
      description: "Keep water nearby and drink regularly. Dehydration can significantly impact focus and energy.",
      icon: "💧"
    },
    {
      title: "Use Music Strategically",
      description: "Background music without lyrics can help maintain focus for some people. Experiment to find what works for you.",
      icon: "🎵"
    },
    {
      title: "Practice Deep Breathing",
      description: "Take a few minutes for deep breathing exercises to reduce stress and improve concentration.",
      icon: "🧘"
    }
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const nextTip = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  const previousTip = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex - 1 + tips.length) % tips.length);
  };

  const currentTip = tips[currentTipIndex];

  return (
    <div className="tips-container">
      <h1>💡 Productivity Tips</h1>
      
      <div className="tip-card">
        <div className="tip-icon">{currentTip.icon}</div>
        <h2 className="tip-title">{currentTip.title}</h2>
        <p className="tip-description">{currentTip.description}</p>
        <div className="tip-counter">
          Tip {currentTipIndex + 1} of {tips.length}
        </div>
      </div>

      <div className="tip-navigation">
        <button onClick={previousTip} className="nav-btn">
          ← Previous
        </button>
        <button onClick={nextTip} className="nav-btn">
          Next →
        </button>
      </div>

      <div className="all-tips-section">
        <h2>All Tips</h2>
        <div className="tips-grid">
          {tips.map((tip, index) => (
            <div 
              key={index} 
              className={`tip-item ${index === currentTipIndex ? 'active' : ''}`}
              onClick={() => setCurrentTipIndex(index)}
            >
              <span className="tip-item-icon">{tip.icon}</span>
              <span className="tip-item-title">{tip.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductivityTips;
