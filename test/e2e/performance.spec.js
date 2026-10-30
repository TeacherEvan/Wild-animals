import { test, expect } from '@playwright/test';

test.describe('Initial payload budget', () => {
  test('loads the shell under 600 KB and fetches no animal audio before a tap', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });

    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
        .filter((entry) => entry.name.startsWith(window.location.origin));

      return {
        bytes: resources.reduce((total, entry) => total + (entry.transferSize || 0), 0),
        audioRequests: resources.filter((entry) => entry.name.includes('/audio/sounds/')).length,
      };
    });

    expect(metrics.audioRequests).toBe(0);
    expect(metrics.bytes).toBeLessThan(600 * 1024);
  });
});
