import { test, expect } from '@playwright/test';

test.describe('Offline PWA', () => {
  test('is installable with no manifest or service-worker errors', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium exposes installability diagnostics');

    await page.goto('/');
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });

    const cdp = await page.context().newCDPSession(page);
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');

    expect(installabilityErrors).toEqual([]);
  });

  test('works offline after the first visit, including animal audio', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Offline service-worker check is Chromium-only in this suite');

    await page.goto('/');
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });

    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });

    // The first load is not controlled until the worker claims clients; a
    // reload guarantees navigations go through the fetch handler.
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 10000 });

    await context.setOffline(true);

    await page.reload();
    await expect(page.locator('h1')).toContainText('Wild Animals Adventure');
    await expect(page.locator('.option-btn')).toHaveCount(4);

    const cueDuration = await page.evaluate(async () => {
      const buffer = await window.soundLoader.loadAnimalSound('Parrot');
      return buffer ? Math.round(buffer.duration * 10) / 10 : null;
    });
    expect(cueDuration).toBeGreaterThan(4);

    await context.setOffline(false);
  });
});
