import { test, expect } from '@playwright/test';

test.describe('Audio Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="app"]');
    // Navigate to audio section
    await page.getByRole('link', { name: /audio/i }).click();
    await page.waitForTimeout(500);
  });

  test('should display audio player section', async ({ page }) => {
    const audioSection = page.locator('#audio');
    await expect(audioSection).toBeVisible();
    
    // Check for section title
    await expect(page.getByText('Focus Audio')).toBeVisible();
  });

  test('should display binaural and ambient tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /binaural/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /ambient/i })).toBeVisible();
  });

  test.describe('Binaural Beats', () => {
    test('should display binaural preset options', async ({ page }) => {
      // Binaural tab should be active by default
      const binauralTab = page.getByRole('tab', { name: /binaural/i });
      await expect(binauralTab).toHaveAttribute('aria-selected', 'true');

      // Check for preset buttons
      await expect(page.getByRole('button', { name: /alpha/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /theta/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /gamma/i })).toBeVisible();
    });

    test('should select different presets', async ({ page }) => {
      // Click Theta preset
      const thetaButton = page.getByRole('button', { name: /theta/i });
      await thetaButton.click();
      
      // Should show as active
      await expect(thetaButton).toHaveAttribute('aria-pressed', 'true');
      
      // Description should update
      await expect(page.getByText(/deep relaxation/i)).toBeVisible();
    });

    test('should show play button', async ({ page }) => {
      const playButton = page.getByRole('button', { name: /play binaural/i });
      await expect(playButton).toBeVisible();
    });

    test('should have volume control', async ({ page }) => {
      const volumeSlider = page.locator('#binaural-volume');
      await expect(volumeSlider).toBeVisible();
      
      // Check ARIA attributes
      await expect(volumeSlider).toHaveAttribute('type', 'range');
      await expect(volumeSlider).toHaveAttribute('min', '0');
      await expect(volumeSlider).toHaveAttribute('max', '1');
    });

    test('should update volume display when slider changes', async ({ page }) => {
      const volumeSlider = page.locator('#binaural-volume');
      
      // Change volume
      await volumeSlider.fill('0.75');
      
      // Volume display should update
      await expect(page.getByText('75%')).toBeVisible();
    });
  });

  test.describe('Ambient Music', () => {
    test.beforeEach(async ({ page }) => {
      // Switch to ambient tab
      await page.getByRole('tab', { name: /ambient/i }).click();
    });

    test('should display ambient track options', async ({ page }) => {
      await expect(page.getByRole('button', { name: /lo-fi/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /rain/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /piano/i })).toBeVisible();
    });

    test('should select different tracks', async ({ page }) => {
      const rainButton = page.getByRole('button', { name: /rain/i });
      await rainButton.click();
      
      // Should show as active
      await expect(rainButton).toHaveAttribute('aria-pressed', 'true');
      
      // Description should update
      await expect(page.getByText(/rain sounds/i)).toBeVisible();
    });

    test('should show play button for ambient tracks', async ({ page }) => {
      const playButton = page.getByRole('button', { name: /play lo-fi/i });
      await expect(playButton).toBeVisible();
    });

    test('should show preview placeholder before playing', async ({ page }) => {
      await expect(page.getByText(/click play to start/i)).toBeVisible();
    });
  });

  test.describe('Tab Switching', () => {
    test('should switch between binaural and ambient tabs', async ({ page }) => {
      // Start on binaural
      const binauralTab = page.getByRole('tab', { name: /binaural/i });
      const ambientTab = page.getByRole('tab', { name: /ambient/i });
      
      await expect(binauralTab).toHaveAttribute('aria-selected', 'true');
      
      // Switch to ambient
      await ambientTab.click();
      await expect(ambientTab).toHaveAttribute('aria-selected', 'true');
      await expect(binauralTab).toHaveAttribute('aria-selected', 'false');
      
      // Ambient content should be visible
      await expect(page.getByText(/ambient music/i)).toBeVisible();
      
      // Switch back to binaural
      await binauralTab.click();
      await expect(binauralTab).toHaveAttribute('aria-selected', 'true');
      
      // Binaural content should be visible
      await expect(page.getByText(/binaural beats are created/i)).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels on tabs', async ({ page }) => {
      const tablist = page.locator('[role="tablist"]');
      await expect(tablist).toHaveAttribute('aria-label', 'Audio type selection');
    });

    test('should have proper tabpanel associations', async ({ page }) => {
      const binauralTab = page.getByRole('tab', { name: /binaural/i });
      await expect(binauralTab).toHaveAttribute('aria-controls', 'binaural-panel');
      
      const binauralPanel = page.locator('#binaural-panel');
      await expect(binauralPanel).toHaveAttribute('aria-labelledby', 'binaural-tab');
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Focus on audio section
      await page.locator('#audio').scrollIntoViewIfNeeded();
      
      // Tab to first interactive element
      await page.keyboard.press('Tab');
      
      // Should be able to navigate tabs with keyboard
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });
});

test.describe('Audio Player - Responsive', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Navigate to audio
    await page.getByRole('link', { name: /audio/i }).click();
    await page.waitForTimeout(500);
    
    // Audio player should still be functional
    await expect(page.getByText('Focus Audio')).toBeVisible();
    await expect(page.getByRole('tab', { name: /binaural/i })).toBeVisible();
  });
});
