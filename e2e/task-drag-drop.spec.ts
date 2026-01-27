// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Task Drag-and-Drop E2E Tests
 * Tests for drag reordering and keyboard accessibility
 */

test.describe('Task Drag-and-Drop (US4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#today')).toBeVisible();

    // Add multiple tasks for reordering tests
    const quickAddInput = page.locator('.quick-add__input');
    await quickAddInput.fill('First task');
    await quickAddInput.press('Enter');
    await quickAddInput.fill('Second task');
    await quickAddInput.press('Enter');
    await quickAddInput.fill('Third task');
    await quickAddInput.press('Enter');

    // Wait for all tasks to appear
    await expect(page.locator('.task-item')).toHaveCount(3, { timeout: 5000 });
  });

  test.describe('Drag Reordering', () => {
    test('should show drag handle on hover', async ({ page }) => {
      const taskItem = page.locator('.task-item').first();
      await taskItem.hover();

      // Drag handle should be visible
      await expect(taskItem.locator('.task-item__drag-handle')).toBeVisible();
    });

    test('should have lift effect when dragging', async ({ page }) => {
      const firstTask = page.locator('.task-item').first();
      const dragHandle = firstTask.locator('.task-item__drag-handle');

      // Start drag
      await firstTask.hover();
      const box = await dragHandle.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();

        // Move slightly to trigger drag
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 10);

        // Check for dragging state (via DragOverlay)
        // The actual task should show reduced opacity or the overlay should be visible
        await page.mouse.up();
      }
    });

    test('should reorder tasks on drag and drop', async ({ page }) => {
      const tasksBefore = await page.locator('.task-item__title').allTextContents();
      expect(tasksBefore[0]).toBe('First task');

      // Perform drag operation
      const firstTask = page.locator('.task-item').first();
      const lastTask = page.locator('.task-item').last();

      await firstTask.hover();
      const firstBox = await firstTask.boundingBox();
      const lastBox = await lastTask.boundingBox();

      if (firstBox && lastBox) {
        // Drag first task to after last task
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height + 20, { steps: 10 });
        await page.mouse.up();

        // Allow time for reorder animation
        await page.waitForTimeout(300);

        // Verify new order (first task should now be last)
        const tasksAfter = await page.locator('.task-item__title').allTextContents();
        expect(tasksAfter[tasksAfter.length - 1]).toBe('First task');
      }
    });

    test('should persist reordered tasks after page reload', async ({ page }) => {
      // Perform drag to reorder
      const firstTask = page.locator('.task-item').first();
      const lastTask = page.locator('.task-item').last();

      await firstTask.hover();
      const firstBox = await firstTask.boundingBox();
      const lastBox = await lastTask.boundingBox();

      if (firstBox && lastBox) {
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height + 20, { steps: 10 });
        await page.mouse.up();

        await page.waitForTimeout(500);

        // Get order after drag
        const orderAfterDrag = await page.locator('.task-item__title').allTextContents();

        // Reload page
        await page.reload();
        await expect(page.locator('#today')).toBeVisible();

        // Wait for tasks to load
        await expect(page.locator('.task-item')).toHaveCount(3, { timeout: 5000 });

        // Verify order is persisted
        const orderAfterReload = await page.locator('.task-item__title').allTextContents();
        expect(orderAfterReload).toEqual(orderAfterDrag);
      }
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should support keyboard navigation through tasks', async ({ page }) => {
      // Focus on first task
      const firstTask = page.locator('.task-item').first();
      await firstTask.focus();

      // Tab should move to next interactive element
      await page.keyboard.press('Tab');

      // Verify focus moved
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper focus indicators', async ({ page }) => {
      const taskItem = page.locator('.task-item').first();
      
      // Focus the task item
      await taskItem.locator('.task-item__checkbox').focus();

      // Check for focus-visible styles
      const checkbox = taskItem.locator('.task-item__checkbox');
      await expect(checkbox).toBeFocused();
    });
  });

  test.describe('Sort Mode Interaction', () => {
    test('should disable drag when sort mode is active', async ({ page }) => {
      // Change sort to priority
      const sortSelect = page.locator('.sort-controls__select');
      await sortSelect.selectOption('priority');

      // Drag handle should not be functional (or hidden)
      const taskItem = page.locator('.task-item').first();
      await taskItem.hover();

      // Attempting to drag should not reorder
      const titlesBefore = await page.locator('.task-item__title').allTextContents();

      const firstTask = page.locator('.task-item').first();
      const lastTask = page.locator('.task-item').last();
      const firstBox = await firstTask.boundingBox();
      const lastBox = await lastTask.boundingBox();

      if (firstBox && lastBox) {
        await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(lastBox.x + lastBox.width / 2, lastBox.y + lastBox.height + 20, { steps: 5 });
        await page.mouse.up();

        await page.waitForTimeout(200);

        const titlesAfter = await page.locator('.task-item__title').allTextContents();
        // Order should remain based on priority sort, not drag
        expect(titlesAfter[0]).toBe(titlesBefore[0]);
      }
    });

    test('should enable drag when returning to manual order', async ({ page }) => {
      // First change to sort mode
      const sortSelect = page.locator('.sort-controls__select');
      await sortSelect.selectOption('priority');

      // Return to manual order
      await sortSelect.selectOption('manual');

      // Drag should now work
      const taskItem = page.locator('.task-item').first();
      await taskItem.hover();

      // Drag handle should be visible and functional
      await expect(taskItem.locator('.task-item__drag-handle')).toBeVisible();
    });
  });
});
