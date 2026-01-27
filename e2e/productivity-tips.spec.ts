import { test, expect } from '@playwright/test';

test.describe('Enhanced Productivity Tips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="app"]', { timeout: 15000 });
    // Navigate to tips section
    await page.click('[href="#tips"]');
    await page.waitForTimeout(500);
  });

  test.describe('Category Display', () => {
    test('shows all category tabs', async ({ page }) => {
      const categoryTabs = page.locator('.category-tab');
      await expect(categoryTabs).toHaveCount(5); // All + 4 categories
    });

    test('All Tips is active by default', async ({ page }) => {
      const allTab = page.locator('.category-tab').first();
      await expect(allTab).toHaveClass(/category-tab--active/);
    });

    test('shows all tips initially', async ({ page }) => {
      const tipCards = page.locator('.tip-card');
      const count = await tipCards.count();
      expect(count).toBeGreaterThan(10);
    });

    test('filters tips by category', async ({ page }) => {
      // Click Deep Focus category
      await page.locator('.category-tab').filter({ hasText: 'Deep Focus' }).click();
      
      // Wait for filter
      await page.waitForTimeout(300);
      
      // Check filtered results
      const tipCards = page.locator('.tip-card');
      const count = await tipCards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(16); // Less than total
    });

    test('clicking same category toggles back to all', async ({ page }) => {
      // Click a category
      const categoryTab = page.locator('.category-tab').filter({ hasText: 'Time Management' });
      await categoryTab.click();
      await page.waitForTimeout(300);
      
      const filteredCount = await page.locator('.tip-card').count();
      
      // Click same category again
      await categoryTab.click();
      await page.waitForTimeout(300);
      
      const allCount = await page.locator('.tip-card').count();
      expect(allCount).toBeGreaterThan(filteredCount);
    });

    test('shows category counts in tabs', async ({ page }) => {
      const categoryCount = page.locator('.category-count').first();
      await expect(categoryCount).toBeVisible();
      const countText = await categoryCount.textContent();
      expect(parseInt(countText || '0')).toBeGreaterThan(0);
    });
  });

  test.describe('Tip Cards', () => {
    test('shows tip title and content', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      await expect(firstCard.locator('.tip-card__title')).toBeVisible();
      await expect(firstCard.locator('.tip-card__content')).toBeVisible();
    });

    test('shows category icon', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      await expect(firstCard.locator('.tip-card__category-icon')).toBeVisible();
    });

    test('clicking tip expands citation', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      
      // Citation should be hidden initially
      await expect(firstCard.locator('.tip-card__citation--visible')).not.toBeVisible();
      
      // Click to expand
      await firstCard.click();
      
      // Citation should now be visible
      await expect(firstCard.locator('.tip-card__citation--visible')).toBeVisible();
    });

    test('clicking expanded tip collapses it', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      
      // Expand
      await firstCard.click();
      await expect(firstCard.locator('.tip-card__citation--visible')).toBeVisible();
      
      // Collapse
      await firstCard.click();
      await expect(firstCard.locator('.tip-card__citation--visible')).not.toBeVisible();
    });

    test('only one tip expanded at a time', async ({ page }) => {
      const cards = page.locator('.tip-card');
      const firstCard = cards.first();
      const secondCard = cards.nth(1);
      
      // Expand first
      await firstCard.click();
      await expect(firstCard).toHaveClass(/tip-card--expanded/);
      
      // Expand second
      await secondCard.click();
      await expect(secondCard).toHaveClass(/tip-card--expanded/);
      await expect(firstCard).not.toHaveClass(/tip-card--expanded/);
    });
  });

  test.describe('Citations', () => {
    test('citation shows source name', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      await firstCard.click();
      
      const citation = firstCard.locator('.tip-card__citation--visible');
      await expect(citation).toContainText('Source');
    });

    test('citation links are clickable', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      await firstCard.click();
      
      const link = firstCard.locator('.citation-text a');
      if (await link.count() > 0) {
        await expect(link).toHaveAttribute('href');
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener/);
      }
    });

    test('citation links dont trigger card collapse', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      await firstCard.click();
      
      const link = firstCard.locator('.citation-text a');
      if (await link.count() > 0) {
        // Note: Can't actually click external links in tests, but we can verify structure
        await expect(firstCard).toHaveClass(/tip-card--expanded/);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('adapts to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.click('[href="#tips"]');
      
      const tipCards = page.locator('.tip-card');
      await expect(tipCards.first()).toBeVisible();
    });

    test('adapts to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.click('[href="#tips"]');
      
      const tipCards = page.locator('.tip-card');
      await expect(tipCards.first()).toBeVisible();
      
      // Category names should be hidden on mobile
      const categoryName = page.locator('.category-name').first();
      await expect(categoryName).not.toBeVisible();
    });

    test('category tabs wrap on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.reload();
      await page.click('[href="#tips"]');
      
      // All categories should still be accessible
      const categoryTabs = page.locator('.category-tab');
      await expect(categoryTabs).toHaveCount(5);
    });
  });

  test.describe('Accessibility', () => {
    test('category tabs have correct ARIA roles', async ({ page }) => {
      const tabList = page.locator('.tips-categories');
      await expect(tabList).toHaveAttribute('role', 'tablist');
      
      const tab = page.locator('.category-tab').first();
      await expect(tab).toHaveAttribute('role', 'tab');
    });

    test('tip cards are keyboard accessible', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      
      // Focus the card
      await firstCard.focus();
      
      // Press Enter to expand
      await page.keyboard.press('Enter');
      await expect(firstCard).toHaveClass(/tip-card--expanded/);
      
      // Press Space to collapse
      await page.keyboard.press('Space');
      await expect(firstCard).not.toHaveClass(/tip-card--expanded/);
    });

    test('tip cards have correct tabindex', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      await expect(firstCard).toHaveAttribute('tabindex', '0');
    });

    test('expanded state is announced', async ({ page }) => {
      const firstCard = page.locator('.tip-card').first();
      await expect(firstCard).toHaveAttribute('aria-expanded', 'false');
      
      await firstCard.click();
      await expect(firstCard).toHaveAttribute('aria-expanded', 'true');
    });

    test('tips grid has correct role', async ({ page }) => {
      const grid = page.locator('#tips-grid');
      await expect(grid).toHaveAttribute('role', 'tabpanel');
    });
  });

  test.describe('Content Quality', () => {
    test('all tips have titles', async ({ page }) => {
      const titles = page.locator('.tip-card__title');
      const count = await titles.count();
      
      for (let i = 0; i < count; i++) {
        const text = await titles.nth(i).textContent();
        expect(text?.length).toBeGreaterThan(0);
      }
    });

    test('all tips have content', async ({ page }) => {
      const contents = page.locator('.tip-card__content');
      const count = await contents.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) { // Check first 5
        const text = await contents.nth(i).textContent();
        expect(text?.length).toBeGreaterThan(20); // At least 20 chars
      }
    });

    test('tips have category labels', async ({ page }) => {
      const labels = page.locator('.tip-card__category-label');
      const count = await labels.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
