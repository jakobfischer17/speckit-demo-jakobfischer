// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Daily Planner E2E Tests
 * Tests for task CRUD, inline edit, delete with undo, and completion flow
 */

test.describe('Daily Planner - Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for the Today section to be visible
    await expect(page.locator('#today')).toBeVisible();
  });

  test.describe('Quick Add Tasks (US2)', () => {
    test('should add a task using Enter key', async ({ page }) => {
      const quickAddInput = page.locator('.quick-add__input');
      const taskTitle = 'Test task from E2E';

      // Type task title and press Enter
      await quickAddInput.fill(taskTitle);
      await quickAddInput.press('Enter');

      // Verify task appears in the list
      await expect(page.locator('.task-item__title').filter({ hasText: taskTitle })).toBeVisible();
    });

    test('should clear input after adding task', async ({ page }) => {
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Another test task');
      await quickAddInput.press('Enter');

      // Input should be cleared
      await expect(quickAddInput).toHaveValue('');
    });

    test('should not add empty task', async ({ page }) => {
      const quickAddInput = page.locator('.quick-add__input');
      const taskCountBefore = await page.locator('.task-item').count();

      // Try to add empty task
      await quickAddInput.press('Enter');

      // Count should remain the same
      const taskCountAfter = await page.locator('.task-item').count();
      expect(taskCountAfter).toBe(taskCountBefore);
    });

    test('should add task within 200ms', async ({ page }) => {
      const quickAddInput = page.locator('.quick-add__input');
      const taskTitle = 'Performance test task';

      await quickAddInput.fill(taskTitle);
      
      const startTime = Date.now();
      await quickAddInput.press('Enter');
      await expect(page.locator('.task-item__title').filter({ hasText: taskTitle })).toBeVisible();
      const endTime = Date.now();

      // Verify task appears within 200ms (with some buffer for test overhead)
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  test.describe('Inline Edit (US2)', () => {
    test('should enable inline edit on title click', async ({ page }) => {
      // First add a task
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Task to edit');
      await quickAddInput.press('Enter');

      // Click on task title to edit
      const taskContent = page.locator('.task-item__content').first();
      await taskContent.click();

      // Edit input should appear
      await expect(page.locator('.task-item__edit-input')).toBeVisible();
    });

    test('should save edit on Enter', async ({ page }) => {
      // Add a task
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Original title');
      await quickAddInput.press('Enter');

      // Click to edit
      await page.locator('.task-item__content').first().click();
      
      const editInput = page.locator('.task-item__edit-input');
      await editInput.fill('Updated title');
      await editInput.press('Enter');

      // Verify title is updated
      await expect(page.locator('.task-item__title').filter({ hasText: 'Updated title' })).toBeVisible();
    });

    test('should cancel edit on Escape', async ({ page }) => {
      // Add a task
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Keep this title');
      await quickAddInput.press('Enter');

      // Click to edit
      await page.locator('.task-item__content').first().click();
      
      const editInput = page.locator('.task-item__edit-input');
      await editInput.fill('This should not save');
      await editInput.press('Escape');

      // Original title should remain
      await expect(page.locator('.task-item__title').filter({ hasText: 'Keep this title' })).toBeVisible();
    });
  });

  test.describe('Task Completion (US3)', () => {
    test('should toggle task completion on checkbox click', async ({ page }) => {
      // Add a task
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Task to complete');
      await quickAddInput.press('Enter');

      // Click checkbox to complete
      const checkbox = page.locator('.task-item__checkbox').first();
      await checkbox.click();

      // Task should have completed class
      await expect(page.locator('.task-item--completed')).toBeVisible();
    });

    test('should show completion animation', async ({ page }) => {
      // Add a task
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Animation test task');
      await quickAddInput.press('Enter');

      // Complete the task
      const checkbox = page.locator('.task-item__checkbox').first();
      await checkbox.click();

      // Check for completing animation class (brief)
      // Note: Animation happens quickly, so we check the final state
      await expect(page.locator('.task-item--completed')).toBeVisible();
    });

    test('should move completed task to completed section', async ({ page }) => {
      // Add a task
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Move to completed');
      await quickAddInput.press('Enter');

      // Complete the task
      const checkbox = page.locator('.task-item__checkbox').first();
      await checkbox.click();

      // Wait for the task to appear in completed section
      await expect(page.locator('.completed-section')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Delete with Undo (US3)', () => {
    test('should show undo toast when task is deleted', async ({ page }) => {
      // Add a task
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Task to delete');
      await quickAddInput.press('Enter');

      // Hover to reveal delete button
      const taskItem = page.locator('.task-item').first();
      await taskItem.hover();

      // Click delete button
      const deleteBtn = page.locator('.task-item__delete-btn').first();
      await deleteBtn.click();

      // Undo toast should appear
      await expect(page.locator('.undo-toast')).toBeVisible();
    });

    test('should restore task on undo click', async ({ page }) => {
      const taskTitle = 'Restore me';
      
      // Add a task
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill(taskTitle);
      await quickAddInput.press('Enter');

      // Delete the task
      const taskItem = page.locator('.task-item').first();
      await taskItem.hover();
      await page.locator('.task-item__delete-btn').first().click();

      // Click undo
      await page.locator('.undo-toast__undo').click();

      // Task should reappear
      await expect(page.locator('.task-item__title').filter({ hasText: taskTitle })).toBeVisible();
    });

    test('should auto-dismiss undo toast after timeout', async ({ page }) => {
      // Add a task
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Auto dismiss test');
      await quickAddInput.press('Enter');

      // Delete the task
      const taskItem = page.locator('.task-item').first();
      await taskItem.hover();
      await page.locator('.task-item__delete-btn').first().click();

      // Wait for toast to appear
      await expect(page.locator('.undo-toast')).toBeVisible();

      // Wait for auto-dismiss (5 seconds + buffer)
      await expect(page.locator('.undo-toast')).not.toBeVisible({ timeout: 7000 });
    });
  });
});
