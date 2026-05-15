# Quickstart: Focus Enhancement Suite

**Date**: 2026-01-26  
**Purpose**: Get developers up to speed quickly

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Modern browser (Chrome, Firefox, Safari, Edge)

## Setup

```bash
# Clone and enter project
cd speckit-demo-jakobfischer

# Install dependencies (including new dev dependencies)
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

## New Dependencies to Add

```bash
# IndexedDB wrapper (production dependency)
npm install idb

# Playwright E2E testing (dev dependency)
npm install -D @playwright/test

# Install Playwright browsers
npx playwright install
```

## Project Structure After Implementation

```
src/
├── components/
│   ├── AudioPlayer/          # US1: Focus audio
│   ├── Statistics/           # US3: Stats dashboard  
│   ├── Rewards/              # US2: Confetti + toasts
│   └── Navigation/           # Section navigation
├── hooks/
│   ├── useStats.js           # Stats state management
│   ├── useBinauralBeat.js    # Web Audio API
│   ├── useMilestones.js      # Achievement tracking
│   └── useScrollSpy.js       # Active section detection
├── services/
│   ├── db.js                 # IndexedDB operations
│   └── statsService.js       # Business logic
└── data/
    └── productivityTips.js   # Enhanced tips content

e2e/
├── playwright.config.ts      # Playwright configuration
├── audio-player.spec.ts      # US1 E2E tests
├── milestone-rewards.spec.ts # US2 E2E tests
├── statistics.spec.ts        # US3 E2E tests
├── productivity-tips.spec.ts # US4 E2E tests
├── navigation.spec.ts        # Navigation tests
└── fixtures/
    └── test-utils.ts         # Shared helpers
```

## Development Workflow

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npm run test:e2e -- e2e/audio-player.spec.ts

# Run tests in UI mode (interactive)
npx playwright test --ui

# Generate test report
npx playwright show-report
```

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

## Key Implementation Notes

### 1. AudioContext User Interaction Requirement

Web Audio API requires user interaction before playing audio:

```jsx
// ❌ Won't work - no user interaction
useEffect(() => {
  const ctx = new AudioContext();
  // Browser blocks this
}, []);

// ✅ Correct - triggered by user click
const handlePlay = () => {
  const ctx = new AudioContext();
  // Works because user clicked
};
```

### 2. IndexedDB Async Operations

All database operations are async. Use the `useStats` hook to handle loading states:

```jsx
function MyComponent() {
  const { stats, isLoading, error } = useStats();
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <Display stats={stats} />;
}
```

### 3. Multi-Tab Synchronization

Stats automatically sync across tabs via BroadcastChannel:

```jsx
// In useStats hook - already implemented
useEffect(() => {
  const channel = new BroadcastChannel('productivity-hub-sync');
  channel.onmessage = (event) => {
    if (event.data.type === 'STATS_UPDATED') {
      refreshStats();
    }
  };
  return () => channel.close();
}, []);
```

### 4. Confetti Performance

Canvas-based confetti must clean up properly:

```jsx
useEffect(() => {
  if (!isActive) return;
  
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  let animationId;
  
  const animate = () => {
    // Draw particles
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  // Cleanup prevents memory leaks
  return () => cancelAnimationFrame(animationId);
}, [isActive]);
```

### 5. CSS Variables for Consistency

Use existing CSS variables from `App.css`:

```css
/* Extend the existing color palette */
.stats-card {
  background: var(--card-background);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}
```

## Playwright Testing Guide

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Audio Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should play binaural beats when clicking play', async ({ page }) => {
    // Navigate to audio section
    await page.getByRole('link', { name: /audio/i }).click();
    
    // Select alpha waves preset
    await page.getByRole('button', { name: /alpha/i }).click();
    
    // Click play
    await page.getByRole('button', { name: /play/i }).click();
    
    // Verify playing state
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
  });
});
```

### Testing Timers with Playwright Clock

```typescript
import { test, expect } from '@playwright/test';

test('pomodoro timer counts down correctly', async ({ page }) => {
  await page.goto('/');
  
  // Install fake timers
  await page.clock.install({ time: new Date('2026-01-26T10:00:00') });
  
  // Start the timer
  await page.getByRole('button', { name: /start/i }).click();
  
  // Fast-forward 1 minute
  await page.clock.fastForward('01:00');
  
  // Verify timer display
  await expect(page.getByText('24:00')).toBeVisible();
});
```

### Testing IndexedDB State

```typescript
import { test, expect } from '@playwright/test';

test('statistics persist across page reloads', async ({ page }) => {
  await page.goto('/');
  
  // Complete a pomodoro (simulate via clock)
  await page.clock.install();
  await page.getByRole('button', { name: /start/i }).click();
  await page.clock.fastForward('25:00');
  
  // Reload page
  await page.reload();
  
  // Navigate to stats
  await page.getByRole('link', { name: /stats/i }).click();
  
  // Verify data persisted
  await expect(page.getByText(/1 pomodoro/i)).toBeVisible();
});
```

### Testing Confetti Animation

```typescript
import { test, expect } from '@playwright/test';

test('confetti appears at 10 pomodoro milestone', async ({ page }) => {
  await page.goto('/');
  
  // Seed IndexedDB with 9 completed pomodoros
  await page.evaluate(() => {
    // Helper to seed test data
    return window.__seedTestData?.({ totalPomodoros: 9 });
  });
  
  // Complete 10th pomodoro
  await page.clock.install();
  await page.getByRole('button', { name: /start/i }).click();
  await page.clock.fastForward('25:00');
  
  // Verify confetti canvas is visible
  await expect(page.locator('canvas.confetti')).toBeVisible();
  
  // Verify achievement toast
  await expect(page.getByText(/10 pomodoros complete/i)).toBeVisible();
});
```

### Accessibility Testing

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('audio player is accessible', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /audio/i }).click();
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('.audio-player')
    .analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Cross-Browser Testing

Playwright config enables testing across browsers:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Debugging Tips

### IndexedDB Inspection

1. Open Chrome DevTools → Application tab
2. Expand IndexedDB → productivity-hub
3. View sessions, stats, achievements stores

### Web Audio API Debugging

```javascript
// Add to useBinauralBeat for debugging
console.log('AudioContext state:', context.state);
console.log('Oscillator frequency:', oscillator.frequency.value);
```

### Performance Profiling

1. Open Chrome DevTools → Performance tab
2. Start recording during confetti animation
3. Verify frame rate stays at 60fps (16.67ms per frame)

## Common Issues

| Issue | Solution |
|-------|----------|
| Audio doesn't play | Ensure user clicked first; check AudioContext state |
| Stats not updating | Check IndexedDB in DevTools; verify BroadcastChannel |
| Confetti janky | Reduce particle count; check for memory leaks |
| Tests timeout | Ensure fake timers are configured; await async operations |
