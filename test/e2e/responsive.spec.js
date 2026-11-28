import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { label: 'small portrait', width: 320, height: 568 },
  { label: 'phone portrait', width: 390, height: 844 },
  { label: 'phone landscape', width: 844, height: 390 },
];

test.describe('Responsive layout', () => {
  for (const viewport of VIEWPORTS) {
    test(`fits ${viewport.label} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });

      const horizontalOverflow = await page.evaluate(() => (
        document.documentElement.scrollWidth - window.innerWidth
      ));
      expect(horizontalOverflow).toBeLessThanOrEqual(1);

      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#sensoryBtn')).toBeVisible();
      await expect(page.locator('.option-btn')).toHaveCount(4);

      const sensoryBox = await page.locator('#sensoryBtn').boundingBox();
      const soundBox = await page.locator('#soundBtn').boundingBox();

      expect(sensoryBox.x).toBeGreaterThanOrEqual(0);
      expect(sensoryBox.x + sensoryBox.width).toBeLessThanOrEqual(viewport.width);
      expect(sensoryBox.x + sensoryBox.width).toBeLessThan(soundBox.x);

      await page.locator('#attentionBtn').click();
      const cardBox = await page.locator('.attention-card').boundingBox();
      expect(cardBox.y).toBeGreaterThanOrEqual(0);
      expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(viewport.height);
      await page.locator('#attentionReady').click();
    });
  }

  test('score board and tap hint stay legible at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });

    const measured = await page.evaluate(() => {
      const board = document.querySelector('.score-board');
      const boardRect = board.getBoundingClientRect();
      const items = [...board.children].map((el) => {
        const r = el.getBoundingClientRect();
        return { right: r.right, height: r.height };
      });
      const hint = document.querySelector('.tap-hint');
      return {
        boardRight: boardRect.right,
        items,
        hintColor: hint ? getComputedStyle(hint).color : null,
        hintWidth: hint ? hint.getBoundingClientRect().width : 0,
      };
    });

    // Regression: four nowrap space-around items at 1.4em collapsed to
    // 234px-tall single characters and overflowed the card by 38px.
    for (const item of measured.items) {
      expect(item.right).toBeLessThanOrEqual(measured.boardRight + 1);
      expect(item.height).toBeLessThan(40);
    }

    // Regression: .tap-hint had no colour rule and inherited pure black
    // on the dark card (~1.3:1). It must resolve to the light text token.
    expect(measured.hintWidth).toBeGreaterThan(0);
    expect(measured.hintColor).toBeTruthy();
    expect(measured.hintColor).not.toBe('rgb(0, 0, 0)');
    expect(measured.hintColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('answers with a real touchscreen tap on mobile projects', async ({ page, browserName }) => {
    const projectName = test.info().project.name;
    test.skip(!['mobile-chrome', 'mobile-safari'].includes(projectName), 'Touch devices only');

    await page.goto('/');
    await page.waitForSelector('.option-btn', { state: 'visible', timeout: 10000 });

    const animalName = await page.evaluate(() => window.currentAnimal.name);
    const option = page.locator(`.option-btn[data-value="${animalName}"]`);
    await option.scrollIntoViewIfNeeded();
    const box = await option.boundingBox();

    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);

    await expect(page.locator('#feedback')).toContainText('Excellent');
    expect(browserName).toBeTruthy();
  });
});
