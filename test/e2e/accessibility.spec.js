import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const settleAnimations = async (page) => {
  // Wait for finite entrance animations to finish. Axe otherwise samples a
  // mid-fade opacity on a slow mobile engine and reports a false contrast
  // failure. Infinite decorative animations are intentionally ignored.
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((animation) => {
      const timing = animation.effect && animation.effect.getComputedTiming();
      return timing && Number.isFinite(timing.endTime) && timing.endTime <= 2000;
    });
    await Promise.all(finite.map((animation) => animation.finished.catch(() => {})));
  });
  await page.waitForTimeout(50);
};

/**
 * Accessibility gate.
 *
 * Axe reports colour-contrast as "incomplete" when an ancestor paints a
 * gradient (the page body does), so this gate asserts on critical AND serious
 * violations, and a separate unit test computes the token contrast ratios that
 * axe cannot see.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<void>}
 */
const expectNoSeriousViolations = async (page) => {
  await settleAnimations(page);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter((violation) => (
    violation.impact === 'critical' || violation.impact === 'serious'
  ));

  const summary = blocking.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target.join(' '),
      summary: node.failureSummary,
      checks: node.any.map((check) => ({ id: check.id, data: check.data })),
    })),
  }));

  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
};

test.describe('Accessibility (axe)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });
  });

  test('main screen has no critical or serious violations', async ({ page }) => {
    await expectNoSeriousViolations(page);
  });

  test('attention cue has no critical or serious violations', async ({ page }) => {
    await page.locator('#attentionBtn').click();
    await expect(page.locator('#attentionOverlay')).toBeVisible();

    await expectNoSeriousViolations(page);
  });

  test('sensory panel has no critical or serious violations', async ({ page }) => {
    await page.locator('#sensoryBtn').click();
    await expect(page.locator('#sensoryPanel')).toBeVisible();

    await expectNoSeriousViolations(page);
  });

  test('wiggle break has no critical or serious violations', async ({ page }) => {
    await page.locator('#wiggleBtn').click();
    await expect(page.locator('#wiggleOverlay')).toBeVisible();

    await expectNoSeriousViolations(page);
  });

  test('dark theme has no critical or serious violations', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    await page.waitForSelector('#animalEmoji', { state: 'visible', timeout: 10000 });

    await expectNoSeriousViolations(page);
  });
});
