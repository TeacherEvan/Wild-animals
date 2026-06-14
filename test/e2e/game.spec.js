import { test, expect } from '@playwright/test';

test.describe('Wild Animals Adventure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for game to initialize
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });
  });

  test('should load and display game title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Wild Animals Adventure');
  });

  test('should display score board with initial values', async ({ page }) => {
    await expect(page.locator('#score')).toHaveText('0');
    await expect(page.locator('#currentQuestion')).toHaveText('1');
    await expect(page.locator('#totalQuestions')).toHaveText('10');
    await expect(page.locator('#streak')).toHaveText('0');
  });

  test('should display animal emoji and question', async ({ page }) => {
    await expect(page.locator('#animalEmoji')).toBeVisible();
    await expect(page.locator('#question')).toContainText('What animal is this?');
  });

  test('should have 6 game mode buttons', async ({ page }) => {
    const modeButtons = page.locator('.mode-btn');
    await expect(modeButtons).toHaveCount(6);
  });

  test('should have powerup buttons', async ({ page }) => {
    await expect(page.locator('#hintBtn')).toBeVisible();
    await expect(page.locator('#eliminateBtn')).toBeVisible();
    await expect(page.locator('#skipBtn')).toBeVisible();
  });

  test('should highlight Classic Mode as active by default', async ({ page }) => {
    const classicBtn = page.locator('.mode-btn:has-text("Classic Mode")');
    await expect(classicBtn).toHaveClass(/active/);
    await expect(classicBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('should play sound when animal emoji is clicked', async ({ page }) => {
    // Click the animal emoji - this should trigger playCurrentAnimalSound
    await page.locator('#animalEmoji').click();
    // No error should occur (the sound plays or falls back to TTS)
    await expect(page.locator('#animalEmoji')).toBeVisible();
  });

  test('should have 4 answer options', async ({ page }) => {
    const options = page.locator('.option-btn');
    await expect(options).toHaveCount(4);
  });

  test('should be able to select a game mode', async ({ page }) => {
    // Click Speed Mode
    await page.locator('.mode-btn:has-text("Speed Mode")').click();
    
    // Verify Speed Mode is now active
    await expect(page.locator('.mode-btn:has-text("Speed Mode")')).toHaveClass(/active/);
    await expect(page.locator('.mode-btn:has-text("Classic Mode")')).not.toHaveClass(/active/);
    
    // Timer should be visible for Speed Mode
    await expect(page.locator('#timerContainer')).toBeVisible();
  });
});

test.describe('Game flow - Classic Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });
  });

  test('should show feedback when answer is selected', async ({ page }) => {
    // Wait for options to be rendered
    await page.waitForSelector('.option-btn', { state: 'visible' });
    
    // Click first option
    await page.locator('.option-btn').first().click();
    
    // Should show feedback
    await expect(page.locator('#feedback')).toBeVisible();
    await expect(page.locator('#feedback')).not.toBeEmpty();
  });

  test('should disable all options after selection', async ({ page }) => {
    await page.waitForSelector('.option-btn', { state: 'visible' });
    await page.locator('.option-btn').first().click();
    
    // All options should be disabled
    const options = page.locator('.option-btn');
    for (let i = 0; i < await options.count(); i++) {
      await expect(options.nth(i)).toBeDisabled();
    }
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });
  });

  test('should have proper ARIA labels on buttons', async ({ page }) => {
    await expect(page.locator('#soundBtn')).toHaveAttribute('aria-label', 'Toggle sound on or off');
    await expect(page.locator('#hintBtn')).toHaveAttribute('aria-label', 'Use hint power-up, 3 remaining');
    await expect(page.locator('#eliminateBtn')).toHaveAttribute('aria-label', 'Eliminate wrong answers, 2 remaining');
    await expect(page.locator('#skipBtn')).toHaveAttribute('aria-label', 'Skip question, 1 remaining');
  });

  test('should have proper heading structure', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toBeVisible();
  });

  test('should have correct lang attribute', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('should have keyboard-accessible animal display', async ({ page }) => {
    const animalDisplay = page.locator('.animal-display');
    await expect(animalDisplay).toHaveAttribute('role', 'button');
    await expect(animalDisplay).toHaveAttribute('tabindex', '0');
  });
});