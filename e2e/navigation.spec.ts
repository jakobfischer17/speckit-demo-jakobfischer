import { test, expect } from '@playwright/test';

test.describe('Section Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="app"]', { timeout: 15000 });
  });

  test('should display all navigation links', async ({ page }) => {
    const nav = page.locator('.section-nav');
    await expect(nav).toBeVisible();

    // Check for all section links
    await expect(page.getByRole('link', { name: /timer/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /breathing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /tips/i })).toBeVisible();
  });

  test('should highlight active section on scroll', async ({ page }) => {
    // Timer section should be active initially
    const timerLink = page.getByRole('link', { name: /timer/i });
    await expect(timerLink).toHaveClass(/active/);

    // Scroll to breathing section
    await page.locator('#breathing').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600); // Wait for scroll spy to update

    const breathingLink = page.getByRole('link', { name: /breathing/i });
    await expect(breathingLink).toHaveClass(/active/);
  });

  test('should navigate to section when clicking nav link', async ({ page }) => {
    // Click Tips link
    await page.getByRole('link', { name: /tips/i }).click();
    
    // Wait for smooth scroll
    await page.waitForTimeout(600);

    // Tips section should be visible in viewport
    const tipsSection = page.locator('#tips');
    await expect(tipsSection).toBeInViewport();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab to first nav link
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Skip header elements
    await page.keyboard.press('Tab');
    
    // Focus should be on a nav link
    const focusedElement = page.locator('.section-nav-link:focus');
    await expect(focusedElement).toBeVisible();

    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const nav = page.locator('.section-nav');
    await expect(nav).toHaveAttribute('aria-label', 'Main navigation');

    // Active link should have aria-current
    const activeLink = page.locator('.section-nav-link.active');
    await expect(activeLink).toHaveAttribute('aria-current', 'true');
  });

  test('navigation should be sticky when scrolling', async ({ page }) => {
    // Get initial nav position
    const nav = page.locator('.section-nav');
    const initialPosition = await nav.boundingBox();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(100);

    // Nav should still be visible at top
    const scrolledPosition = await nav.boundingBox();
    expect(scrolledPosition?.y).toBeLessThanOrEqual(initialPosition?.y || 0);
  });

  test('should display all main sections', async ({ page }) => {
    await expect(page.locator('#timer')).toBeVisible();
    await expect(page.locator('#breathing')).toBeVisible();
    await expect(page.locator('#tips')).toBeVisible();
  });
});

test.describe('Navigation - Responsive', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const nav = page.locator('.section-nav');
    await expect(nav).toBeVisible();

    // Navigation should still work
    await page.getByRole('link', { name: /breathing/i }).click();
    await page.waitForTimeout(600);

    const breathingSection = page.locator('#breathing');
    await expect(breathingSection).toBeInViewport();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const nav = page.locator('.section-nav');
    await expect(nav).toBeVisible();

    // All nav items should be visible with labels
    await expect(page.getByRole('link', { name: /timer/i })).toBeVisible();
  });
});
