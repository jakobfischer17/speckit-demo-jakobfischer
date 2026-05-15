# Component Contracts: Focus Enhancement Suite

**Date**: 2026-01-26  
**Purpose**: Define public interfaces for all new components

---

## Hooks

### useStats

Manages focus statistics state and IndexedDB persistence.

```typescript
interface UseStatsReturn {
  // State
  stats: UserStats | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  recordSession: (session: Omit<FocusSession, 'id'>) => Promise<void>;
  refreshStats: () => Promise<void>;
}

function useStats(): UseStatsReturn;
```

**Behavior**:
- Loads stats from IndexedDB on mount
- Listens to BroadcastChannel for cross-tab updates
- `recordSession` creates session, updates aggregates, triggers cleanup
- Automatically handles streak calculation

---

### useBinauralBeat

Generates binaural beats using Web Audio API.

```typescript
interface BinauralConfig {
  baseFrequency: number;   // Hz, typically 200
  beatFrequency: number;   // Hz difference (6, 10, or 40)
  volume: number;          // 0-1
}

interface UseBinauralBeatReturn {
  isPlaying: boolean;
  isReady: boolean;
  error: Error | null;
  
  play: () => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setFrequencies: (base: number, beat: number) => void;
}

function useBinauralBeat(config?: BinauralConfig): UseBinauralBeatReturn;
```

**Behavior**:
- Creates AudioContext on first `play()` call (user interaction required)
- Manages dual oscillators with stereo panning
- Smooth fade-in/out on play/pause
- Properly disposes AudioContext on unmount

---

### useAudioContext

Singleton AudioContext manager for all audio features.

```typescript
interface UseAudioContextReturn {
  context: AudioContext | null;
  state: AudioContextState;  // 'suspended' | 'running' | 'closed'
  
  resume: () => Promise<void>;
  suspend: () => Promise<void>;
}

function useAudioContext(): UseAudioContextReturn;
```

**Behavior**:
- Lazily creates AudioContext on first access
- Shares single context across all audio hooks
- Handles browser autoplay policy (resume on user interaction)

---

### useMilestones

Tracks pomodoro milestones and celebration state.

```typescript
interface Milestone {
  type: string;
  threshold: number;
  reached: boolean;
  celebrated: boolean;
}

interface UseMilestonesReturn {
  milestones: Milestone[];
  pendingCelebration: Milestone | null;
  
  checkMilestones: (totalPomodoros: number) => void;
  markCelebrated: (type: string) => Promise<void>;
}

function useMilestones(): UseMilestonesReturn;
```

**Behavior**:
- Loads achievement state from IndexedDB
- Returns first uncelebrated milestone when threshold passed
- `markCelebrated` persists celebration completion

---

### useScrollSpy

Detects which section is currently visible for nav highlighting.

```typescript
interface UseScrollSpyOptions {
  sectionIds: string[];
  offset?: number;        // Pixels from top to consider "active"
  threshold?: number;     // Intersection threshold (0-1)
}

interface UseScrollSpyReturn {
  activeSection: string | null;
}

function useScrollSpy(options: UseScrollSpyOptions): UseScrollSpyReturn;
```

**Behavior**:
- Uses Intersection Observer API
- Updates `activeSection` when section enters threshold
- Handles edge cases (top of page, no sections visible)

---

## Components

### AudioPlayer

Container component for focus audio functionality.

```typescript
interface AudioPlayerProps {
  className?: string;
}

// No external state management - self-contained
function AudioPlayer(props: AudioPlayerProps): JSX.Element;
```

**Internal State**:
- Selected track (binaural or ambient)
- Volume level
- Playing state

**Renders**:
- Track selection tabs (Binaural / Ambient)
- Volume slider
- Play/pause controls
- Active track indicator

---

### BinauralGenerator

Sub-component for binaural beat selection and playback.

```typescript
interface BinauralGeneratorProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

function BinauralGenerator(props: BinauralGeneratorProps): JSX.Element;
```

**Renders**:
- Frequency preset buttons (Alpha, Theta, Gamma)
- Frequency description
- Play/stop button
- Visual frequency indicator

---

### AmbientPlayer

Sub-component for YouTube ambient track playback.

```typescript
interface AmbientPlayerProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

function AmbientPlayer(props: AmbientPlayerProps): JSX.Element;
```

**Renders**:
- Track selection list
- YouTube iframe (hidden or minimal)
- Play/pause button
- Error state with fallback link

---

### Statistics

Dashboard component showing focus statistics.

```typescript
interface StatisticsProps {
  className?: string;
}

function Statistics(props: StatisticsProps): JSX.Element;
```

**Internal State**:
- Stats from `useStats` hook

**Renders**:
- Summary cards (total time, pomodoros, streaks)
- 7-day chart
- Loading/error states

---

### StatsCard

Individual statistic display card.

```typescript
interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;           // Emoji or icon identifier
  trend?: 'up' | 'down' | 'neutral';
}

function StatsCard(props: StatsCardProps): JSX.Element;
```

---

### WeeklyChart

Bar chart showing daily focus time for past 7 days.

```typescript
interface WeeklyChartProps {
  data: Record<string, number>;  // date string → seconds
}

function WeeklyChart(props: WeeklyChartProps): JSX.Element;
```

**Behavior**:
- Pure CSS bars (no charting library)
- Responsive width
- Hover shows exact time
- Accessible via ARIA labels

---

### Confetti

Celebration animation overlay.

```typescript
interface ConfettiProps {
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high' | 'grand';
  duration?: number;      // ms, default 4000
  onComplete?: () => void;
}

function Confetti(props: ConfettiProps): JSX.Element;
```

**Behavior**:
- Renders canvas overlay when `isActive`
- Animates particles using requestAnimationFrame
- Calls `onComplete` when animation finishes
- Does not block pointer events

---

### AchievementToast

Toast notification for milestone achievements.

```typescript
interface AchievementToastProps {
  achievement: {
    type: string;
    message: string;
    icon: string;
  } | null;
  onDismiss: () => void;
}

function AchievementToast(props: AchievementToastProps): JSX.Element;
```

**Behavior**:
- Slides in from bottom when `achievement` is set
- Auto-dismisses after 5 seconds
- Can be manually dismissed

---

### SectionNav

Sticky navigation bar for section jumping.

```typescript
interface SectionNavProps {
  sections: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
  activeSection: string | null;
}

function SectionNav(props: SectionNavProps): JSX.Element;
```

**Behavior**:
- Renders sticky header with section links
- Highlights active section
- Smooth scrolls to section on click
- Keyboard navigable

---

## Services

### db.js

IndexedDB wrapper using `idb` library.

```typescript
// Initialize database
async function initDB(): Promise<IDBDatabase>;

// Sessions
async function addSession(session: FocusSession): Promise<string>;
async function getSessionsByDateRange(start: Date, end: Date): Promise<FocusSession[]>;
async function deleteSessionsBefore(date: Date): Promise<number>;

// Stats
async function getStats(): Promise<UserStats | undefined>;
async function updateStats(stats: UserStats): Promise<void>;

// Achievements
async function getAchievements(): Promise<Achievement[]>;
async function saveAchievement(achievement: Achievement): Promise<void>;
```

---

### statsService.js

Business logic for statistics operations.

```typescript
// Record a completed session and update all aggregates
async function recordCompletedSession(
  type: 'work' | 'shortBreak' | 'longBreak',
  duration: number
): Promise<{
  session: FocusSession;
  stats: UserStats;
  newMilestone: Achievement | null;
}>;

// Get formatted stats for display
async function getDisplayStats(): Promise<{
  totalPomodoros: number;
  totalFocusTimeFormatted: string;
  currentStreak: number;
  longestStreak: number;
  todayFocusTime: number;
  weeklyData: Record<string, number>;
}>;

// Cleanup old sessions (call periodically)
async function cleanupOldSessions(): Promise<number>;
```
