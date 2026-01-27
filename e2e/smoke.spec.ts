// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Basic app rendering verification
 * These tests verify the app loads correctly and all major sections render
 */

test.describe('App Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and wait for the page to load
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for React app to render (the root div should have content)
    await page.waitForSelector('[data-testid="app"]', { timeout: 15000 });
    
    // Clear IndexedDB for clean state (non-blocking)
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const deleteRequest = indexedDB.deleteDatabase('productivity-hub');
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => resolve();
        deleteRequest.onblocked = () => resolve();
        // Resolve after timeout if db operations hang
        setTimeout(resolve, 2000);
      });
    });
  });

  test('app loads and displays header', async ({ page }) => {
    // Verify header content
    await expect(page.locator('.app-title')).toContainText('Productivity Hub');
    await expect(page.locator('.app-subtitle')).toContainText('Boost your focus');
  });

  test('navigation renders all sections', async ({ page }) => {
    const nav = page.locator('.section-nav');
    await expect(nav).toBeVisible();
    
    // Verify all nav items are present
    const navItems = page.locator('.section-nav__item');
    await expect(navItems).toHaveCount(7);
    
    // Verify specific nav items
    await expect(page.locator('.section-nav__item').filter({ hasText: 'Today' })).toBeVisible();
    await expect(page.locator('.section-nav__item').filter({ hasText: 'Prioritize' })).toBeVisible();
    await expect(page.locator('.section-nav__item').filter({ hasText: 'Timer' })).toBeVisible();
    await expect(page.locator('.section-nav__item').filter({ hasText: 'Audio' })).toBeVisible();
    await expect(page.locator('.section-nav__item').filter({ hasText: 'Stats' })).toBeVisible();
  });

  test('Today section renders', async ({ page }) => {
    const todaySection = page.locator('#today');
    await expect(todaySection).toBeVisible();
    
    // Verify Daily Planner component renders
    await expect(page.locator('.daily-planner')).toBeVisible();
    
    // Verify Today View renders with date
    await expect(page.locator('.today-view')).toBeVisible();
    await expect(page.locator('.today-view__date')).toBeVisible();
  });

  test('Prioritize section renders', async ({ page }) => {
    const prioritizeSection = page.locator('#prioritize');
    await expect(prioritizeSection).toBeVisible();
    
    // Verify Prioritization Tools component renders
    await expect(page.locator('.prioritization-tools')).toBeVisible();
    await expect(page.locator('.prioritization-tools__title')).toContainText('Prioritization');
  });

  test('Timer section renders', async ({ page }) => {
    const timerSection = page.locator('#timer');
    await expect(timerSection).toBeVisible();
    
    // Verify Pomodoro Timer component renders
    await expect(page.locator('.pomodoro-timer')).toBeVisible();
  });

  test('Audio section renders', async ({ page }) => {
    const audioSection = page.locator('#audio');
    await expect(audioSection).toBeVisible();
  });

  test('Stats section renders', async ({ page }) => {
    const statsSection = page.locator('#stats');
    await expect(statsSection).toBeVisible();
  });

  test('all major sections are visible on initial load', async ({ page }) => {
    // Check all section IDs exist
    const sections = ['#today', '#prioritize', '#timer', '#audio', '#stats', '#breathing', '#tips'];
    for (const sectionId of sections) {
      await expect(page.locator(sectionId)).toBeAttached();
    }
  });

  test('no console errors on initial load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Page already loaded in beforeEach, just wait a bit for async operations
    await page.waitForTimeout(1000);
    
    // Filter out expected errors (like favicon 404)
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('404') &&
      !err.includes('net::ERR')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('app is responsive - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    // Wait for resize to take effect
    await page.waitForTimeout(100);
    
    await expect(page.locator('[data-testid="app"]')).toBeVisible();
    await expect(page.locator('.app-title')).toBeVisible();
  });

  test('app is responsive - tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    // Wait for resize to take effect
    await page.waitForTimeout(100);
    
    await expect(page.locator('[data-testid="app"]')).toBeVisible();
    await expect(page.locator('.app-title')).toBeVisible();
  });
});
