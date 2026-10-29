import { test, expect } from '@playwright/test';

/**
 * Switch to Speed Mode and wait for the re-render to settle.
 * selectMode awaits a 150ms loading state and rebuilds the options, so clicking
 * an option too early targets a node that is about to be detached.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 */
const startSpeedMode = async (page) => {
  await page.locator('.mode-btn[data-mode="speed"]').click();
  await expect(page.locator('.mode-btn[data-mode="speed"]')).toHaveClass(/active/);
  await expect(page.locator('#timerContainer')).toBeVisible();
  await page.waitForFunction(() => (
    document.querySelectorAll('.option-btn').length === 4 &&
    !document.getElementById('gameArea').classList.contains('loading-state')
  ));
  await page.waitForTimeout(500);
};

test.describe('Attention and sensory tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });
  });

  test('shows the attention, wiggle and sensory controls', async ({ page }) => {
    await expect(page.locator('#attentionBtn')).toBeVisible();
    await expect(page.locator('#wiggleBtn')).toBeVisible();
    await expect(page.locator('#sensoryBtn')).toBeVisible();
    await expect(page.locator('#attentionBtn')).toHaveAttribute(
      'aria-label',
      'Start the eyes on me attention cue'
    );
  });

  test('opens and closes the eyes-on-me attention cue', async ({ page }) => {
    await page.locator('#attentionBtn').click();

    const overlay = page.locator('#attentionOverlay');
    await expect(overlay).toBeVisible();
    await expect(page.locator('#attentionTitle')).toHaveText('Eyes on me!');
    await expect(page.locator('#attentionCall')).toContainText('Eyes on you!');
    await expect(page.locator('body')).toHaveClass(/attention-paused/);

    await page.locator('#attentionReady').click();

    await expect(overlay).toBeHidden();
    await expect(page.locator('body')).not.toHaveClass(/attention-paused/);
  });

  test('runs a wiggle break and lets the child skip out', async ({ page }) => {
    await page.locator('#wiggleBtn').click();

    const overlay = page.locator('#wiggleOverlay');
    await expect(overlay).toBeVisible();
    await expect(page.locator('#wiggleTitle')).toHaveText('Stomp like an elephant');
    await expect(page.locator('body')).toHaveClass(/break-active/);

    await page.locator('#wiggleSkip').click();

    await expect(overlay).toBeHidden();
    await expect(page.locator('body')).not.toHaveClass(/break-active/);
  });

  test('persists the gentle-motion preference across a reload', async ({ page }) => {
    await page.locator('#sensoryBtn').click();
    await expect(page.locator('#sensoryPanel')).toBeVisible();

    await page.locator('[data-pref="gentleMotion"]').check();

    await expect(page.locator('html')).toHaveAttribute('data-motion', 'gentle');

    await page.reload();
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });

    await expect(page.locator('html')).toHaveAttribute('data-motion', 'gentle');
    await page.locator('#sensoryBtn').click();
    await expect(page.locator('[data-pref="gentleMotion"]')).toBeChecked();
  });

  test('applies high contrast immediately', async ({ page }) => {
    await page.locator('#sensoryBtn').click();
    await page.locator('[data-pref="highContrast"]').check();

    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  });

  test('shows a chunked visual schedule for classic mode', async ({ page }) => {
    await expect(page.locator('#chunkItem')).toBeVisible();
    await expect(page.locator('#chunkProgress')).toHaveText('Set 1 of 2');
    await expect(page.locator('#chunkDots .chunk-dot')).toHaveCount(10);
    await expect(page.locator('#chunkDots .chunk-dot-current')).toHaveCount(1);
  });

  test('gentle motion suppresses celebration particles', async ({ page }) => {
    await page.locator('#sensoryBtn').click();
    await page.locator('[data-pref="gentleMotion"]').check();

    const animalName = await page.evaluate(() => window.currentAnimal.name);
    await page.locator(`.option-btn[data-value="${animalName}"]`).click();

    await expect(page.locator('#feedback')).toContainText('Excellent');
    await expect(page.locator('.particle')).toHaveCount(0);
  });

  test('keeps the sensory toolbar fixed while the page scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.evaluate(() => window.scrollTo(0, 400));

    const toolbarBox = await page.locator('#sensoryBtn').boundingBox();
    expect(toolbarBox.y).toBeLessThan(80);
  });

  test('keeps the attention card inside a short viewport', async ({ page }) => {
    await page.setViewportSize({ width: 740, height: 360 });
    await page.locator('#attentionBtn').click();

    const cardBox = await page.locator('.attention-card').boundingBox();
    expect(cardBox.y).toBeGreaterThanOrEqual(0);
    expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(360);
  });

  test('traps focus inside the attention cue and makes the background inert', async ({ page }) => {
    await page.locator('#attentionBtn').click();

    await expect(page.locator('#attentionReady')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#attentionReady')).toBeFocused();
    await expect(page.locator('#main-content')).toHaveAttribute('inert', '');

    await page.locator('#attentionReady').click();

    await expect(page.locator('#main-content')).not.toHaveAttribute('inert', '');
  });

  test('keeps sound disabled across a reload, including the audio engine', async ({ page }) => {
    await page.locator('#soundBtn').click();
    await expect(page.locator('#soundBtn')).toHaveText('🔇');

    await page.reload();
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });

    await expect(page.locator('#soundBtn')).toHaveText('🔇');
    expect(await page.evaluate(() => window.realAnimalSounds.isEnabled)).toBe(false);
  });

  test('pauses the speed clock while the attention cue is open', async ({ page }) => {
    await startSpeedMode(page);

    const beforeCue = await page.locator('#timerText').textContent();
    await page.locator('#attentionBtn').click();
    await page.waitForTimeout(1600);

    const duringCue = await page.locator('#timerText').textContent();
    expect(duringCue).toBe(beforeCue);

    await page.locator('#attentionReady').click();
    await page.waitForTimeout(1200);

    const afterCue = await page.locator('#timerText').textContent();
    expect(afterCue).not.toBe(beforeCue);
  });

  test('freezes the pending auto-advance while the cue is open', async ({ page }) => {
    await startSpeedMode(page);

    const animalName = await page.evaluate(() => window.currentAnimal.name);
    await page.locator(`.option-btn[data-value="${animalName}"]`).click();

    const questionBeforeCue = await page.locator('#currentQuestion').textContent();
    await page.locator('#attentionBtn').click();
    await page.waitForTimeout(2600);

    await expect(page.locator('#currentQuestion')).toHaveText(questionBeforeCue);

    await page.locator('#attentionReady').click();
    await expect(page.locator('#currentQuestion')).toHaveText(
      String(Number(questionBeforeCue) + 1),
      { timeout: 3000 }
    );
  });

  test('uses dark ink for light-card headings in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });

    await page.locator('#attentionBtn').click();
    await expect(page.locator('.attention-title')).toHaveCSS('color', 'rgb(31, 95, 58)');
    await page.locator('#attentionReady').click();
  });
});
