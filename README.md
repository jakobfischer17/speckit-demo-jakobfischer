# Productivity Hub

A React SPA (Single Page Application) for productivity enhancement, featuring focus audio, milestone rewards, and science-backed productivity tips.

## Features

### 🍅 Pomodoro Timer
- Work sessions (25 minutes default)
- Short breaks (5 minutes)
- Long breaks (15 minutes)
- Custom timer settings (1-120 minutes)
- Browser notifications when time is up
- Start/pause/reset controls
- Session tracking with milestone rewards

### 🎵 Focus Audio Player (NEW)
- **Binaural Beats Generator**
  - Alpha waves (10 Hz) - Focus & concentration
  - Theta waves (6 Hz) - Deep meditation
  - Gamma waves (40 Hz) - Peak performance
  - Adjustable volume control
  - Visual wave animation
  
- **Ambient Music Player**
  - Curated YouTube tracks: Lo-fi Study Beats, Rain Sounds, Soft Piano
  - Simple play/pause controls
  - Fallback handling for unavailable content

### 📊 Focus Statistics Dashboard (NEW)
- Total sessions and focus time tracking
- Current and longest streak display
- 7-day weekly chart visualization
- Multi-tab synchronization via BroadcastChannel
- Motivational messages based on progress
- IndexedDB persistence for data retention

### 🏆 Milestone Rewards (NEW)
- Confetti celebrations at milestones (10, 25, 50, 100 sessions)
- Achievement toast notifications with slide-in animation
- Persistent achievement tracking
- Keyboard dismissible (Escape key)

### 💡 Science-Backed Productivity Tips (ENHANCED)
- 16 categorized productivity tips
- 4 categories: Deep Focus, Time Management, Well-being, Environment
- Research citations with source links
- Expandable cards with academic references
- Filter by category or view all tips

### 🧘 Breathing Exercises
- Three breathing techniques:
  - **Box Breathing**: 4-4-4-4 pattern with a dot tracing an actual box
  - **4-7-8 Breathing**: Vertical rise-and-release guide for relaxation
  - **Energizing Breath**: Rhythmic bar animation for quick breath cycles
- Pattern-specific visual guide
- Phase-by-phase instructions
- Countdown timer for each phase

### 🧭 Section Navigation (NEW)
- Sticky navigation bar with smooth scrolling
- Active section highlighting via Intersection Observer
- Keyboard navigation support
- Accessible ARIA attributes

## Tech Stack

- **React 19** with Vite 7
- **IndexedDB** (via `idb` wrapper) for persistent storage
- **Web Audio API** for binaural beat generation
- **YouTube IFrame API** for ambient music
- **Canvas API** for confetti animations
- **Intersection Observer API** for scroll detection
- **BroadcastChannel API** for multi-tab sync
- **CSS Variables** for theming
- **Vitest + Testing Library** for component and service testing

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
# Run all component and service tests
npm test

# Run tests in watch mode
npm run test:watch

# Run planner-focused tests only
npm run test:tasks
```

### Lint
```bash
npm run lint
```

## Browser Support

- Chrome/Edge (Chromium)
- Firefox
- Safari (WebKit)

## Accessibility

- ARIA labels and roles throughout
- Keyboard navigation support
- Reduced motion support via `prefers-reduced-motion`
- High contrast mode support
- Screen reader compatible

## Project Structure

```
src/
├── components/
│   ├── AudioPlayer/        # Binaural beats & ambient music
│   ├── Navigation/         # Section nav with scroll spy
│   ├── Rewards/            # Confetti & achievement toast
│   ├── Statistics/         # Stats dashboard & charts
│   ├── BreathingExercise.jsx
│   ├── PomodoroTimer.jsx
│   └── ProductivityTips.jsx
├── data/
│   ├── audioTracks.js      # Audio configuration
│   └── productivityTips.js # Categorized tips with citations
├── hooks/
│   ├── useAudioContext.js  # Singleton AudioContext
│   ├── useBinauralBeat.js  # Binaural beat generation
│   ├── useMilestones.js    # Achievement tracking
│   ├── useScrollSpy.js     # Intersection Observer
│   └── useStats.js         # Statistics state
└── services/
    ├── db.js               # IndexedDB operations
    └── statsService.js     # Session recording & sync
```

## Tech Stack
- React 19
- Vite
- CSS3 with animations

## Future Enhancements
This application is designed to be enhanced with SpecKit for improved functionality and user experience.

