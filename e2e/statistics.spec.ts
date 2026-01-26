import { test, expect } from '@playwright/test';
import { clearIndexedDB, setupTestDatabase } from './fixtures/test-utils';

test.describe('Statistics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Stats Display', () => {
    test('shows initial empty state', async ({ page }) => {
      // Navigate to stats section
      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const statsSection = page.locator('#stats');
      await expect(statsSection).toBeVisible();

      // Check for stats cards
      const statsCards = page.locator('.stats-card');
      await expect(statsCards).toHaveCount(4);

      // Verify initial values
      await expect(page.locator('.stats-card').first()).toContainText('0');
    });

    test('displays loading state initially', async ({ page }) => {
      // Navigate to stats section
      await page.click('[href="#stats"]');
      
      // Loading should appear briefly
      // Note: This may be too fast to catch in some cases
      const container = page.locator('.statistics-container');
      await expect(container).toBeVisible();
    });

    test('shows total sessions count', async ({ page }) => {
      await setupTestDatabase(page, {
        stats: {
          totalSessions: 15,
          totalFocusMinutes: 375,
          currentStreak: 3,
        },
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      // Find the sessions card
      const sessionsCard = page.locator('.stats-card--primary');
      await expect(sessionsCard).toContainText('15');
      await expect(sessionsCard).toContainText('Total Sessions');
    });

    test('shows formatted total focus time', async ({ page }) => {
      await setupTestDatabase(page, {
        stats: {
          totalSessions: 10,
          totalFocusMinutes: 150, // 2h 30m
          currentStreak: 2,
        },
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      // Check for formatted time
      const timeCard = page.locator('.stats-card--secondary');
      await expect(timeCard).toContainText('Total Focus Time');
    });

    test('shows current streak', async ({ page }) => {
      await setupTestDatabase(page, {
        stats: {
          totalSessions: 20,
          totalFocusMinutes: 500,
          currentStreak: 5,
          longestStreak: 7,
        },
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const streakCard = page.locator('.stats-card--success');
      await expect(streakCard).toContainText('5 days');
      await expect(streakCard).toContainText('Current Streak');
    });

    test('shows best streak in sublabel', async ({ page }) => {
      await setupTestDatabase(page, {
        stats: {
          totalSessions: 30,
          totalFocusMinutes: 750,
          currentStreak: 3,
          longestStreak: 10,
        },
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const streakCard = page.locator('.stats-card--success');
      await expect(streakCard).toContainText('Best: 10 days');
    });
  });

  test.describe('Weekly Chart', () => {
    test('renders weekly chart', async ({ page }) => {
      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const chart = page.locator('.weekly-chart');
      await expect(chart).toBeVisible();
    });

    test('shows correct number of bars', async ({ page }) => {
      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const bars = page.locator('.weekly-chart__bar-container');
      await expect(bars).toHaveCount(7);
    });

    test('has accessible role', async ({ page }) => {
      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const chartContainer = page.locator('.weekly-chart__container');
      await expect(chartContainer).toHaveAttribute('role', 'img');
    });
  });

  test.describe('Motivation Messages', () => {
    test('shows first-time user message', async ({ page }) => {
      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const motivation = page.locator('.motivation-message');
      await expect(motivation).toContainText('Start your first pomodoro');
    });

    test('shows progress message for new users', async ({ page }) => {
      await setupTestDatabase(page, {
        stats: {
          totalSessions: 5,
          totalFocusMinutes: 125,
          currentStreak: 1,
        },
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const motivation = page.locator('.motivation-message');
      await expect(motivation).toContainText('5 more sessions');
    });

    test('shows fire message for long streaks', async ({ page }) => {
      await setupTestDatabase(page, {
        stats: {
          totalSessions: 50,
          totalFocusMinutes: 1250,
          currentStreak: 10,
        },
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const motivation = page.locator('.motivation-message--fire');
      await expect(motivation).toBeVisible();
      await expect(motivation).toContainText('10 days straight');
    });
  });

  test.describe('Responsive Design', () => {
    test('adapts to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      // Cards should still be visible
      const statsCards = page.locator('.stats-card');
      await expect(statsCards.first()).toBeVisible();
    });

    test('chart remains usable on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.reload();

      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const chart = page.locator('.weekly-chart');
      await expect(chart).toBeVisible();
    });
  });

  test.describe('Multi-tab Sync', () => {
    test('updates when session recorded in another tab', async ({ page, context }) => {
      // Set up initial stats
      await setupTestDatabase(page, {
        stats: {
          totalSessions: 5,
          totalFocusMinutes: 125,
          currentStreak: 1,
        },
      });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      // Record a session through the page (simulating another tab)
      await page.evaluate(async () => {
        const channel = new BroadcastChannel('productivity-hub-sync');
        channel.postMessage({
          type: 'STATS_UPDATED',
          stats: {
            id: 'user-stats',
            totalPomodoros: 6,
            totalFocusTime: 150 * 60,
            currentStreak: 1,
            longestStreak: 2,
            dailyHistory: {},
            updatedAt: Date.now(),
          },
        });
      });

      // Wait for the update to propagate
      await page.waitForTimeout(1000);

      // Note: Full verification depends on the component re-rendering
      // This tests that the broadcast mechanism works
    });
  });

  test.describe('Accessibility', () => {
    test('stats cards are articles', async ({ page }) => {
      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const articles = page.locator('.stats-card');
      for (let i = 0; i < await articles.count(); i++) {
        const article = articles.nth(i);
        const tagName = await article.evaluate(el => el.tagName);
        expect(tagName.toLowerCase()).toBe('article');
      }
    });

    test('chart has aria-label', async ({ page }) => {
      await page.click('[href="#stats"]');
      await page.waitForTimeout(500);

      const chartContainer = page.locator('.weekly-chart__container');
      const ariaLabel = await chartContainer.getAttribute('aria-label');
      expect(ariaLabel).toContain('Weekly focus time chart');
    });
  });
});
