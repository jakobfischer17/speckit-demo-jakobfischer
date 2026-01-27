// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Prioritization Tools E2E Tests
 * Tests for Eisenhower Matrix, Top 3 Focus, and RICE Scoring
 */

test.describe('Prioritization Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // First add some tasks to work with
    const quickAddInput = page.locator('.quick-add__input');
    for (let i = 1; i <= 5; i++) {
      await quickAddInput.fill(`Task ${i}`);
      await quickAddInput.press('Enter');
    }

    // Wait for tasks to be added
    await expect(page.locator('.task-item')).toHaveCount(5, { timeout: 5000 });

    // Navigate to Prioritization Tools section
    await page.locator('text=Prioritize').click();
    await expect(page.locator('#prioritize')).toBeVisible();
  });

  test.describe('Eisenhower Matrix (US6)', () => {
    test('should display 4 quadrants', async ({ page }) => {
      // Verify all quadrants are visible
      await expect(page.locator('[data-quadrant="do-first"]')).toBeVisible();
      await expect(page.locator('[data-quadrant="schedule"]')).toBeVisible();
      await expect(page.locator('[data-quadrant="delegate"]')).toBeVisible();
      await expect(page.locator('[data-quadrant="eliminate"]')).toBeVisible();
    });

    test('should display staging area with unassigned tasks', async ({ page }) => {
      const stagingArea = page.locator('.eisenhower-matrix__staging');
      await expect(stagingArea).toBeVisible();

      // Unassigned tasks should be in staging
      const stagingTasks = stagingArea.locator('.eisenhower-matrix__task');
      await expect(stagingTasks).toHaveCount(5);
    });

    test('should allow dragging task to quadrant', async ({ page }) => {
      const stagingTask = page.locator('.eisenhower-matrix__staging .eisenhower-matrix__task').first();
      const doFirstQuadrant = page.locator('[data-quadrant="do-first"]');

      const taskText = await stagingTask.textContent();

      // Get bounding boxes
      const taskBox = await stagingTask.boundingBox();
      const quadrantBox = await doFirstQuadrant.boundingBox();

      if (taskBox && quadrantBox) {
        // Drag task to Do First quadrant
        await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(
          quadrantBox.x + quadrantBox.width / 2,
          quadrantBox.y + quadrantBox.height / 2,
          { steps: 10 }
        );
        await page.mouse.up();

        // Wait for update
        await page.waitForTimeout(500);

        // Task should now be in Do First quadrant
        const quadrantTasks = doFirstQuadrant.locator('.eisenhower-matrix__task');
        await expect(quadrantTasks.filter({ hasText: taskText || '' })).toBeVisible();
      }
    });

    test('should update task priority when moved to quadrant', async ({ page }) => {
      // This would need to verify the underlying task data changed
      // For E2E, we verify the visual change happened
      const stagingTask = page.locator('.eisenhower-matrix__staging .eisenhower-matrix__task').first();
      const doFirstQuadrant = page.locator('[data-quadrant="do-first"]');

      const taskBox = await stagingTask.boundingBox();
      const quadrantBox = await doFirstQuadrant.boundingBox();

      if (taskBox && quadrantBox) {
        await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(
          quadrantBox.x + quadrantBox.width / 2,
          quadrantBox.y + quadrantBox.height / 2,
          { steps: 10 }
        );
        await page.mouse.up();

        await page.waitForTimeout(500);

        // Verify task shows high priority badge (Do First = High priority)
        const movedTask = doFirstQuadrant.locator('.eisenhower-matrix__task').first();
        const priorityBadge = movedTask.locator('.eisenhower-matrix__task-priority--high');
        await expect(priorityBadge).toBeVisible();
      }
    });
  });

  test.describe('Top 3 Focus Generator (US7)', () => {
    test('should show generate button when tasks exist', async ({ page }) => {
      const generateBtn = page.locator('.top-three-focus__generate-btn');
      await expect(generateBtn).toBeVisible();
    });

    test('should generate top 3 tasks on button click', async ({ page }) => {
      const generateBtn = page.locator('.top-three-focus__generate-btn');
      await generateBtn.click();

      // Wait for generation
      await expect(page.locator('.top-three-focus__card')).toHaveCount(3, { timeout: 5000 });
    });

    test('should show task reasoning for each focus item', async ({ page }) => {
      const generateBtn = page.locator('.top-three-focus__generate-btn');
      await generateBtn.click();

      await expect(page.locator('.top-three-focus__card')).toHaveCount(3, { timeout: 5000 });

      // Each card should have reasoning text
      const reasonings = page.locator('.top-three-focus__reasoning');
      await expect(reasonings).toHaveCount(3);
    });

    test('should allow dismissing a focus item', async ({ page }) => {
      const generateBtn = page.locator('.top-three-focus__generate-btn');
      await generateBtn.click();

      await expect(page.locator('.top-three-focus__card')).toHaveCount(3, { timeout: 5000 });

      // Get first card's task title
      const firstCard = page.locator('.top-three-focus__card').first();
      const dismissBtn = firstCard.locator('.top-three-focus__dismiss');

      await firstCard.hover();
      await dismissBtn.click();

      // A replacement should be suggested (still 3 cards, but different one)
      await expect(page.locator('.top-three-focus__card')).toHaveCount(3);
    });

    test('should allow clearing all focus items', async ({ page }) => {
      const generateBtn = page.locator('.top-three-focus__generate-btn');
      await generateBtn.click();

      await expect(page.locator('.top-three-focus__card')).toHaveCount(3, { timeout: 5000 });

      // Click clear button
      const clearBtn = page.locator('text=Clear');
      await clearBtn.click();

      // Focus cards should be gone
      await expect(page.locator('.top-three-focus__card')).toHaveCount(0);

      // Generate button should reappear
      await expect(page.locator('.top-three-focus__generate-btn')).toBeVisible();
    });

    test('should show regenerate option', async ({ page }) => {
      const generateBtn = page.locator('.top-three-focus__generate-btn');
      await generateBtn.click();

      await expect(page.locator('.top-three-focus__card')).toHaveCount(3, { timeout: 5000 });

      // Regenerate button should be visible
      await expect(page.locator('text=Regenerate')).toBeVisible();
    });
  });

  test.describe('RICE Scoring Tool (US8)', () => {
    test('should show task selector', async ({ page }) => {
      const selector = page.locator('.rice-scoring__select');
      await expect(selector).toBeVisible();
    });

    test('should show score editor when task selected', async ({ page }) => {
      const selector = page.locator('.rice-scoring__select');
      await selector.selectOption({ index: 1 }); // Select first task

      // Editor should appear
      await expect(page.locator('.rice-scoring__editor')).toBeVisible();
    });

    test('should display RICE score sliders', async ({ page }) => {
      const selector = page.locator('.rice-scoring__select');
      await selector.selectOption({ index: 1 });

      // All 4 sliders should be visible
      const sliders = page.locator('.rice-scoring__slider');
      await expect(sliders).toHaveCount(4);
    });

    test('should calculate RICE score in real-time', async ({ page }) => {
      const selector = page.locator('.rice-scoring__select');
      await selector.selectOption({ index: 1 });

      // Get initial score
      const scoreDisplay = page.locator('.rice-scoring__result-value');
      const initialScore = await scoreDisplay.textContent();

      // Change a slider value
      const reachSlider = page.locator('.rice-scoring__slider').first();
      await reachSlider.fill('10'); // Max reach

      // Score should update
      const newScore = await scoreDisplay.textContent();
      expect(newScore).not.toBe(initialScore);
    });

    test('should save RICE score', async ({ page }) => {
      const selector = page.locator('.rice-scoring__select');
      await selector.selectOption({ index: 1 });

      // Adjust sliders
      const reachSlider = page.locator('.rice-scoring__slider').first();
      await reachSlider.fill('8');

      // Click save
      const saveBtn = page.locator('.rice-scoring__btn--primary');
      await saveBtn.click();

      // Editor should close
      await expect(page.locator('.rice-scoring__editor')).not.toBeVisible();

      // Task should appear in leaderboard
      await expect(page.locator('.rice-scoring__leaderboard-item')).toBeVisible();
    });

    test('should show RICE leaderboard after scoring tasks', async ({ page }) => {
      // Score a task
      const selector = page.locator('.rice-scoring__select');
      await selector.selectOption({ index: 1 });

      const saveBtn = page.locator('.rice-scoring__btn--primary');
      await saveBtn.click();

      // Leaderboard should be visible
      await expect(page.locator('.rice-scoring__leaderboard')).toBeVisible();
      await expect(page.locator('.rice-scoring__leaderboard-item')).toHaveCount(1);
    });

    test('should sort tasks by RICE score in leaderboard', async ({ page }) => {
      // Score multiple tasks with different scores
      for (let i = 1; i <= 3; i++) {
        const selector = page.locator('.rice-scoring__select');
        await selector.selectOption({ index: 1 }); // Always select first unscored

        // Set reach to different values to get different scores
        const reachSlider = page.locator('.rice-scoring__slider').first();
        await reachSlider.fill(String(i * 3));

        const saveBtn = page.locator('.rice-scoring__btn--primary');
        await saveBtn.click();

        await page.waitForTimeout(200);
      }

      // Get leaderboard scores
      const scores = await page.locator('.rice-scoring__leaderboard-score').allTextContents();
      const numericScores = scores.map((s) => parseFloat(s));

      // Verify sorted in descending order
      for (let i = 0; i < numericScores.length - 1; i++) {
        expect(numericScores[i]).toBeGreaterThanOrEqual(numericScores[i + 1]);
      }
    });
  });
});
