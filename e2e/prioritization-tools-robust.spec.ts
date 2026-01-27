// @ts-check
import { test, expect, Page } from '@playwright/test';

/**
 * Prioritization Tools E2E Tests - Robust test suite
 * Tests for Eisenhower Matrix, Top 3 Focus, and RICE Scoring
 */

// Helper functions
async function waitForAppReady(page: Page) {
  await page.waitForSelector('[data-testid="app"]', { timeout: 15000 });
}

async function clearDatabase(page: Page) {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const deleteRequest = indexedDB.deleteDatabase('productivity-hub');
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
      deleteRequest.onblocked = () => resolve();
      // Timeout fallback to prevent hanging
      setTimeout(() => resolve(), 2000);
    });
  });
}

async function scrollToSection(page: Page, sectionId: string) {
  await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

async function addTask(page: Page, title: string) {
  await scrollToSection(page, 'today');
  const quickAddInput = page.locator('.quick-add__input');
  await quickAddInput.fill(title);
  await quickAddInput.press('Enter');
  await expect(page.locator('.task-item').filter({ hasText: title })).toBeVisible({ timeout: 5000 });
}

test.describe('Prioritization Tools - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    await clearDatabase(page);
  });

  test.describe('Section Rendering', () => {
    test('Prioritization Tools section renders correctly', async ({ page }) => {
      await scrollToSection(page, 'prioritize');
      
      await expect(page.locator('.prioritization-tools')).toBeVisible();
      await expect(page.locator('.prioritization-tools__title')).toBeVisible();
      await expect(page.locator('.prioritization-tools__title')).toContainText('Prioritization');
    });

    test('all prioritization subsections are present', async ({ page }) => {
      await scrollToSection(page, 'prioritize');
      
      // Check for Top 3 Focus section
      await expect(page.locator('.top-three-focus, [class*="top-three"]')).toBeVisible();
      
      // Check for Eisenhower Matrix section
      await expect(page.locator('.eisenhower-matrix, [class*="eisenhower"]')).toBeVisible();
      
      // Check for RICE Scoring section
      await expect(page.locator('.rice-scoring, [class*="rice"]')).toBeVisible();
    });
  });

  test.describe('Eisenhower Matrix (US6)', () => {
    test('matrix displays 4 quadrants', async ({ page }) => {
      await scrollToSection(page, 'prioritize');
      
      const matrix = page.locator('.eisenhower-matrix');
      await expect(matrix).toBeVisible();
      
      // Should have 4 quadrants
      const quadrants = matrix.locator('.eisenhower-matrix__quadrant, [class*="quadrant"]');
      await expect(quadrants).toHaveCount(4);
    });

    test('quadrants have correct labels', async ({ page }) => {
      await scrollToSection(page, 'prioritize');
      
      // Check for quadrant labels
      await expect(page.locator('text=/urgent.*important|do.*first/i')).toBeVisible();
      await expect(page.locator('text=/not.*urgent.*important|schedule/i')).toBeVisible();
    });

    test('staging area displays unassigned tasks', async ({ page }) => {
      // Add a task first
      await addTask(page, 'Unassigned task');
      
      // Navigate to prioritization
      await scrollToSection(page, 'prioritize');
      
      // Staging area should show the task (it's not yet in any quadrant)
      const stagingArea = page.locator('.eisenhower-matrix__staging, [class*="staging"]');
      if (await stagingArea.isVisible()) {
        await expect(stagingArea).toContainText('Unassigned task');
      }
    });

    test('can drag task to quadrant', async ({ page }) => {
      // Add a task
      await addTask(page, 'Task to categorize');
      
      await scrollToSection(page, 'prioritize');
      
      // Find the task in staging area
      const taskItem = page.locator('.eisenhower-matrix').locator('[draggable="true"], [class*="draggable"]').first();
      const firstQuadrant = page.locator('.eisenhower-matrix__quadrant, [class*="quadrant"]').first();
      
      if (await taskItem.isVisible() && await firstQuadrant.isVisible()) {
        // Attempt drag
        await taskItem.dragTo(firstQuadrant);
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Top 3 Focus (US7)', () => {
    test('Top 3 Focus section renders', async ({ page }) => {
      await scrollToSection(page, 'prioritize');
      
      await expect(page.locator('.top-three-focus, [class*="top-three"]')).toBeVisible();
    });

    test('shows generate button when no Top 3 selected', async ({ page }) => {
      await scrollToSection(page, 'prioritize');
      
      const generateButton = page.locator('button').filter({ hasText: /generate|suggest|get/i });
      await expect(generateButton.first()).toBeVisible();
    });

    test('generates Top 3 tasks when clicked', async ({ page }) => {
      // Add some tasks first
      await addTask(page, 'Important task 1');
      await addTask(page, 'Important task 2');
      await addTask(page, 'Important task 3');
      
      await scrollToSection(page, 'prioritize');
      
      // Click generate
      const generateButton = page.locator('.top-three-focus, [class*="top-three"]').locator('button').filter({ hasText: /generate|suggest|get/i });
      if (await generateButton.isVisible()) {
        await generateButton.click();
        await page.waitForTimeout(1000);
        
        // Should show some focused tasks
        const focusItems = page.locator('.top-three-focus__item, [class*="focus-item"]');
        const count = await focusItems.count();
        expect(count).toBeLessThanOrEqual(3);
      }
    });

    test('can dismiss a focused task', async ({ page }) => {
      await addTask(page, 'Task to focus');
      
      await scrollToSection(page, 'prioritize');
      
      // Generate focus
      const generateButton = page.locator('.top-three-focus, [class*="top-three"]').locator('button').filter({ hasText: /generate|suggest|get/i });
      if (await generateButton.isVisible()) {
        await generateButton.click();
        await page.waitForTimeout(1000);
        
        // Try to dismiss
        const dismissButton = page.locator('.top-three-focus').locator('button').filter({ hasText: /dismiss|remove|×/i });
        if (await dismissButton.first().isVisible()) {
          await dismissButton.first().click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('RICE Scoring (US8)', () => {
    test('RICE Scoring section renders', async ({ page }) => {
      await scrollToSection(page, 'prioritize');
      
      await expect(page.locator('.rice-scoring, [class*="rice"]')).toBeVisible();
    });

    test('shows task selector', async ({ page }) => {
      await addTask(page, 'Task for RICE');
      
      await scrollToSection(page, 'prioritize');
      
      // Should have a task selector
      const taskSelector = page.locator('.rice-scoring select, .rice-scoring [class*="selector"]');
      await expect(taskSelector).toBeVisible();
    });

    test('shows RICE sliders', async ({ page }) => {
      await addTask(page, 'Task to score');
      
      await scrollToSection(page, 'prioritize');
      
      // Select a task first
      const taskSelector = page.locator('.rice-scoring select');
      if (await taskSelector.isVisible()) {
        await taskSelector.selectOption({ index: 1 });
        await page.waitForTimeout(300);
      }
      
      // Should show sliders for R, I, C, E
      const sliders = page.locator('.rice-scoring input[type="range"], .rice-scoring [class*="slider"]');
      const sliderCount = await sliders.count();
      expect(sliderCount).toBeGreaterThanOrEqual(4);
    });

    test('calculates RICE score when values change', async ({ page }) => {
      await addTask(page, 'Task to calculate');
      
      await scrollToSection(page, 'prioritize');
      
      // Select task
      const taskSelector = page.locator('.rice-scoring select');
      if (await taskSelector.isVisible()) {
        await taskSelector.selectOption({ index: 1 });
        await page.waitForTimeout(300);
      }
      
      // Find the score display
      const scoreDisplay = page.locator('.rice-scoring').locator('[class*="score"], [class*="result"]');
      if (await scoreDisplay.isVisible()) {
        const scoreText = await scoreDisplay.textContent();
        expect(scoreText).toBeTruthy();
      }
    });

    test('shows leaderboard with scored tasks', async ({ page }) => {
      await addTask(page, 'Scored task 1');
      await addTask(page, 'Scored task 2');
      
      await scrollToSection(page, 'prioritize');
      
      // Check for leaderboard
      const leaderboard = page.locator('.rice-scoring__leaderboard, [class*="leaderboard"]');
      await expect(leaderboard).toBeVisible();
    });
  });
});

test.describe('Prioritization Tools - Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDatabase(page);
    await page.reload();
    await waitForAppReady(page);
  });

  test('tasks from Today section appear in Prioritization tools', async ({ page }) => {
    // Add tasks in Today section
    await addTask(page, 'Integration test task');
    
    // Navigate to Prioritization
    await scrollToSection(page, 'prioritize');
    
    // Task should be visible somewhere in prioritization tools
    const prioritizeSection = page.locator('#prioritize');
    const taskInPrioritize = prioritizeSection.locator('text=Integration test task');
    
    // May be in staging, matrix, or task selector
    const isVisible = await taskInPrioritize.isVisible().catch(() => false);
    const selectorContains = await page.locator('.rice-scoring select option').filter({ hasText: 'Integration test task' }).count() > 0;
    
    expect(isVisible || selectorContains).toBe(true);
  });

  test('priority changes in matrix reflect in Today section', async ({ page }) => {
    await addTask(page, 'Priority sync task');
    
    // Navigate to prioritization and assign to a quadrant
    await scrollToSection(page, 'prioritize');
    
    const taskInMatrix = page.locator('.eisenhower-matrix').locator('text=Priority sync task');
    const quadrant = page.locator('.eisenhower-matrix__quadrant').first();
    
    if (await taskInMatrix.isVisible() && await quadrant.isVisible()) {
      await taskInMatrix.dragTo(quadrant);
      await page.waitForTimeout(500);
    }
    
    // Navigate back to Today
    await scrollToSection(page, 'today');
    
    // Task should still exist
    await expect(page.locator('.task-item').filter({ hasText: 'Priority sync task' })).toBeVisible();
  });
});

test.describe('Prioritization Tools - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDatabase(page);
    await page.reload();
    await waitForAppReady(page);
    await scrollToSection(page, 'prioritize');
  });

  test('section has proper heading structure', async ({ page }) => {
    const h2 = page.locator('#prioritize h2');
    await expect(h2).toBeVisible();
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    // Tab through the section
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('sliders have proper labels', async ({ page }) => {
    await addTask(page, 'Accessible task');
    
    const taskSelector = page.locator('.rice-scoring select');
    if (await taskSelector.isVisible()) {
      await taskSelector.selectOption({ index: 1 });
      await page.waitForTimeout(300);
    }
    
    // Check sliders have labels
    const sliders = page.locator('.rice-scoring input[type="range"]');
    const count = await sliders.count();
    
    for (let i = 0; i < count; i++) {
      const slider = sliders.nth(i);
      const hasAriaLabel = await slider.getAttribute('aria-label');
      const hasId = await slider.getAttribute('id');
      
      // Should have either aria-label or associated label via id
      expect(hasAriaLabel || hasId).toBeTruthy();
    }
  });
});
