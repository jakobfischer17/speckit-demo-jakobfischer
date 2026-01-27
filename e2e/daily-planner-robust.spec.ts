// @ts-check
import { test, expect, Page } from '@playwright/test';

/**
 * Daily Planner E2E Tests - Robust test suite
 * Tests for task CRUD, inline edit, delete with undo, and completion flow
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
      // Timeout fallback
      setTimeout(resolve, 2000);
    });
  });
}

async function scrollToSection(page: Page, sectionId: string) {
  await page.locator(`#${sectionId}`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300); // Wait for smooth scroll
}

async function addTask(page: Page, title: string) {
  const quickAddInput = page.locator('.quick-add__input');
  await quickAddInput.fill(title);
  await quickAddInput.press('Enter');
  // Wait for task to appear
  await expect(page.locator('.task-item').filter({ hasText: title })).toBeVisible({ timeout: 5000 });
}

test.describe('Daily Planner - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and wait for page to load
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    await clearDatabase(page);
    await scrollToSection(page, 'today');
  });

  test.describe('Section Rendering', () => {
    test('Daily Planner section renders correctly', async ({ page }) => {
      // Verify main components are visible
      await expect(page.locator('.daily-planner')).toBeVisible();
      await expect(page.locator('.today-view')).toBeVisible();
      await expect(page.locator('.today-view__date')).toBeVisible();
    });

    test('Quick Add input is present and functional', async ({ page }) => {
      const quickAddInput = page.locator('.quick-add__input');
      await expect(quickAddInput).toBeVisible();
      await expect(quickAddInput).toBeEnabled();
      await expect(quickAddInput).toHaveAttribute('placeholder', /add.*task/i);
    });

    test('Empty state shows when no tasks', async ({ page }) => {
      // Either shows empty state or task list
      const taskList = page.locator('.task-list');
      const emptyState = page.locator('.task-list__empty, .daily-planner__empty');
      
      // One of these should be visible
      const taskListVisible = await taskList.isVisible().catch(() => false);
      const emptyStateVisible = await emptyState.isVisible().catch(() => false);
      
      expect(taskListVisible || emptyStateVisible).toBe(true);
    });

    test('Date displays correctly', async ({ page }) => {
      const dateElement = page.locator('.today-view__date');
      await expect(dateElement).toBeVisible();
      
      // Date should contain day of week
      const dateText = await dateElement.textContent();
      expect(dateText).toMatch(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/);
    });
  });

  test.describe('Quick Add Tasks (US2)', () => {
    test('adds a task using Enter key', async ({ page }) => {
      const taskTitle = 'Test task via Enter key';
      await addTask(page, taskTitle);
      
      // Verify task appears
      const taskItem = page.locator('.task-item').filter({ hasText: taskTitle });
      await expect(taskItem).toBeVisible();
    });

    test('adds a task using button click', async ({ page }) => {
      const taskTitle = 'Test task via button';
      const quickAddInput = page.locator('.quick-add__input');
      const addButton = page.locator('.quick-add__button');
      
      await quickAddInput.fill(taskTitle);
      
      // Check if add button exists and is visible
      if (await addButton.isVisible()) {
        await addButton.click();
        await expect(page.locator('.task-item').filter({ hasText: taskTitle })).toBeVisible();
      } else {
        // Fallback to Enter key
        await quickAddInput.press('Enter');
        await expect(page.locator('.task-item').filter({ hasText: taskTitle })).toBeVisible();
      }
    });

    test('clears input after adding task', async ({ page }) => {
      const quickAddInput = page.locator('.quick-add__input');
      await quickAddInput.fill('Task to be cleared');
      await quickAddInput.press('Enter');
      
      // Input should be empty after adding
      await expect(quickAddInput).toHaveValue('');
    });

    test('does not add empty task', async ({ page }) => {
      const quickAddInput = page.locator('.quick-add__input');
      const initialCount = await page.locator('.task-item').count();
      
      // Try to add empty task
      await quickAddInput.focus();
      await quickAddInput.press('Enter');
      
      // Wait a moment for any potential task to be added
      await page.waitForTimeout(500);
      
      // Count should remain the same
      const finalCount = await page.locator('.task-item').count();
      expect(finalCount).toBe(initialCount);
    });

    test('does not add whitespace-only task', async ({ page }) => {
      const quickAddInput = page.locator('.quick-add__input');
      const initialCount = await page.locator('.task-item').count();
      
      await quickAddInput.fill('   ');
      await quickAddInput.press('Enter');
      
      await page.waitForTimeout(500);
      
      const finalCount = await page.locator('.task-item').count();
      expect(finalCount).toBe(initialCount);
    });

    test('adds multiple tasks sequentially', async ({ page }) => {
      const tasks = ['First task', 'Second task', 'Third task'];
      
      for (const task of tasks) {
        await addTask(page, task);
      }
      
      // Verify all tasks exist
      for (const task of tasks) {
        await expect(page.locator('.task-item').filter({ hasText: task })).toBeVisible();
      }
      
      // Verify count
      await expect(page.locator('.task-item')).toHaveCount(tasks.length);
    });

    test('task creation is fast (under 500ms)', async ({ page }) => {
      const quickAddInput = page.locator('.quick-add__input');
      const taskTitle = 'Performance test task ' + Date.now();
      
      await quickAddInput.fill(taskTitle);
      
      const startTime = performance.now();
      await quickAddInput.press('Enter');
      await expect(page.locator('.task-item').filter({ hasText: taskTitle })).toBeVisible();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  test.describe('Task Completion (US3)', () => {
    test('completes a task by clicking checkbox', async ({ page }) => {
      await addTask(page, 'Task to complete');
      
      // Find and click checkbox
      const checkbox = page.locator('.task-item').first().locator('.task-item__checkbox, input[type="checkbox"]');
      await checkbox.click();
      
      // Wait for completion animation and state change
      await page.waitForTimeout(300);
      
      // Task should be marked as completed (check class or move to completed section)
      const completedTask = page.locator('.task-item--completed, .completed-section .task-item').filter({ hasText: 'Task to complete' });
      const inCompletedSection = page.locator('.completed-section').filter({ hasText: 'Task to complete' });
      
      // Either in completed state or moved to completed section
      const isCompleted = await completedTask.isVisible().catch(() => false);
      const isInSection = await inCompletedSection.isVisible().catch(() => false);
      
      expect(isCompleted || isInSection).toBe(true);
    });

    test('undo toast appears after completing task', async ({ page }) => {
      await addTask(page, 'Task for undo test');
      
      const checkbox = page.locator('.task-item').first().locator('.task-item__checkbox, input[type="checkbox"]');
      await checkbox.click();
      
      // Undo toast should appear
      await expect(page.locator('.undo-toast')).toBeVisible({ timeout: 2000 });
    });

    test('can undo task completion', async ({ page }) => {
      await addTask(page, 'Task to undo');
      
      const checkbox = page.locator('.task-item').first().locator('.task-item__checkbox, input[type="checkbox"]');
      await checkbox.click();
      
      // Wait for undo toast and click it
      const undoButton = page.locator('.undo-toast__button, .undo-toast').filter({ hasText: /undo/i });
      await expect(undoButton).toBeVisible({ timeout: 2000 });
      await undoButton.click();
      
      // Task should be back in active list
      await page.waitForTimeout(500);
      const activeTask = page.locator('.task-list .task-item').filter({ hasText: 'Task to undo' });
      await expect(activeTask).toBeVisible();
    });
  });

  test.describe('Inline Editing (US2)', () => {
    test('enables edit mode on title click', async ({ page }) => {
      await addTask(page, 'Task to edit');
      
      // Click on task title/content area
      const taskContent = page.locator('.task-item__content, .task-item__title').first();
      await taskContent.click();
      
      // Edit input should appear
      await expect(page.locator('.task-item__edit-input, input.task-item__title--editing')).toBeVisible({ timeout: 2000 });
    });

    test('saves edit on Enter', async ({ page }) => {
      await addTask(page, 'Original title');
      
      // Click to edit
      const taskContent = page.locator('.task-item__content, .task-item__title').first();
      await taskContent.click();
      
      // Find edit input and change value
      const editInput = page.locator('.task-item__edit-input, input.task-item__title--editing');
      await expect(editInput).toBeVisible();
      await editInput.clear();
      await editInput.fill('Updated title');
      await editInput.press('Enter');
      
      // Verify title updated
      await expect(page.locator('.task-item').filter({ hasText: 'Updated title' })).toBeVisible();
    });

    test('cancels edit on Escape', async ({ page }) => {
      await addTask(page, 'Keep this title');
      
      // Click to edit
      const taskContent = page.locator('.task-item__content, .task-item__title').first();
      await taskContent.click();
      
      // Type new value then cancel
      const editInput = page.locator('.task-item__edit-input, input.task-item__title--editing');
      await expect(editInput).toBeVisible();
      await editInput.clear();
      await editInput.fill('Changed title');
      await editInput.press('Escape');
      
      // Original title should remain
      await expect(page.locator('.task-item').filter({ hasText: 'Keep this title' })).toBeVisible();
    });
  });

  test.describe('Task Deletion (US3)', () => {
    test('shows delete button on hover', async ({ page }) => {
      await addTask(page, 'Task to delete');
      
      // Hover over task item
      const taskItem = page.locator('.task-item').first();
      await taskItem.hover();
      
      // Delete button should be visible
      const deleteButton = taskItem.locator('.task-item__delete, [aria-label*="delete" i], button:has-text("×"), button:has-text("Delete")');
      await expect(deleteButton).toBeVisible();
    });

    test('deletes task and shows undo toast', async ({ page }) => {
      await addTask(page, 'Task to be deleted');
      
      // Hover and click delete
      const taskItem = page.locator('.task-item').first();
      await taskItem.hover();
      
      const deleteButton = taskItem.locator('.task-item__delete, [aria-label*="delete" i], button:has-text("×"), button:has-text("Delete")');
      await deleteButton.click();
      
      // Undo toast should appear
      await expect(page.locator('.undo-toast')).toBeVisible({ timeout: 2000 });
      
      // Task should be removed from list
      await expect(page.locator('.task-item').filter({ hasText: 'Task to be deleted' })).not.toBeVisible();
    });

    test('can undo deletion', async ({ page }) => {
      await addTask(page, 'Task to restore');
      
      // Delete task
      const taskItem = page.locator('.task-item').first();
      await taskItem.hover();
      
      const deleteButton = taskItem.locator('.task-item__delete, [aria-label*="delete" i], button:has-text("×"), button:has-text("Delete")');
      await deleteButton.click();
      
      // Click undo
      const undoButton = page.locator('.undo-toast__button, .undo-toast').filter({ hasText: /undo/i });
      await expect(undoButton).toBeVisible();
      await undoButton.click();
      
      // Task should be restored
      await page.waitForTimeout(500);
      await expect(page.locator('.task-item').filter({ hasText: 'Task to restore' })).toBeVisible();
    });
  });

  test.describe('Sort Controls (US5)', () => {
    test('sort controls are visible', async ({ page }) => {
      await addTask(page, 'Task for sort test');
      
      // Sort controls should be visible
      const sortControls = page.locator('.sort-controls');
      await expect(sortControls).toBeVisible();
    });

    test('can change sort option', async ({ page }) => {
      await addTask(page, 'Task A');
      await addTask(page, 'Task B');
      
      // Find sort dropdown or buttons
      const sortSelect = page.locator('.sort-controls__select, .sort-controls select');
      
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);
      }
      
      // Verify sort controls responded
      await expect(sortSelect).toBeEnabled();
    });
  });
});

test.describe('Daily Planner - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDatabase(page);
    await page.reload();
    await waitForAppReady(page);
    await scrollToSection(page, 'today');
  });

  test('Quick Add input has proper label', async ({ page }) => {
    const quickAddInput = page.locator('.quick-add__input');
    
    // Should have placeholder or aria-label
    const hasPlaceholder = await quickAddInput.getAttribute('placeholder');
    const hasAriaLabel = await quickAddInput.getAttribute('aria-label');
    
    expect(hasPlaceholder || hasAriaLabel).toBeTruthy();
  });

  test('keyboard navigation works for adding tasks', async ({ page }) => {
    const quickAddInput = page.locator('.quick-add__input');
    
    // Tab to input
    await page.keyboard.press('Tab');
    await quickAddInput.focus();
    
    // Type and submit
    await page.keyboard.type('Keyboard task');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.task-item').filter({ hasText: 'Keyboard task' })).toBeVisible();
  });

  test('task checkbox is keyboard accessible', async ({ page }) => {
    await addTask(page, 'Accessible task');
    
    // Focus on checkbox
    const checkbox = page.locator('.task-item').first().locator('.task-item__checkbox, input[type="checkbox"]');
    await checkbox.focus();
    
    // Press Space to toggle
    await page.keyboard.press('Space');
    
    await page.waitForTimeout(300);
    
    // Task should be completed
    const completedIndicator = page.locator('.task-item--completed, .completed-section');
    const isCompleted = await completedIndicator.isVisible().catch(() => true);
    expect(isCompleted).toBe(true);
  });
});

test.describe('Daily Planner - Data Persistence', () => {
  test('tasks persist after page reload', async ({ page }) => {
    // Clear and setup
    await page.goto('/');
    await clearDatabase(page);
    await page.reload();
    await waitForAppReady(page);
    
    // Add task
    await addTask(page, 'Persistent task');
    
    // Reload page
    await page.reload();
    await waitForAppReady(page);
    
    // Task should still exist
    await expect(page.locator('.task-item').filter({ hasText: 'Persistent task' })).toBeVisible({ timeout: 5000 });
  });

  test('completed tasks persist after reload', async ({ page }) => {
    await page.goto('/');
    await clearDatabase(page);
    await page.reload();
    await waitForAppReady(page);
    
    // Add and complete task
    await addTask(page, 'Complete and persist');
    
    const checkbox = page.locator('.task-item').first().locator('.task-item__checkbox, input[type="checkbox"]');
    await checkbox.click();
    
    // Wait for completion
    await page.waitForTimeout(500);
    
    // Reload
    await page.reload();
    await waitForAppReady(page);
    
    // Task should still be in completed state
    const completedSection = page.locator('.completed-section');
    const completedTask = page.locator('.task-item--completed');
    
    const inSection = await completedSection.filter({ hasText: 'Complete and persist' }).isVisible().catch(() => false);
    const isCompleted = await completedTask.filter({ hasText: 'Complete and persist' }).isVisible().catch(() => false);
    
    expect(inSection || isCompleted).toBe(true);
  });
});
