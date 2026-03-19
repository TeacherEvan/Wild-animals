const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class MockUtterance {
      constructor(text) {
        this.text = text;
      }
    }

    window.SpeechSynthesisUtterance = MockUtterance;
    window.speechSynthesis = {
      cancel() {},
      speak(utterance) {
        setTimeout(() => utterance.onend && utterance.onend(), 0);
      }
    };
  });

  await page.goto('/');
});

test('classic mode advances after a correct answer', async ({ page }) => {
  await page.getByRole('button', { name: 'Classic Mode' }).click();
  await page.locator('.option-btn[data-correct="true"]').click();
  await expect(page.locator('#nextBtn')).toBeEnabled();
  await page.locator('#nextBtn').click();
  await expect(page.locator('#currentQuestion')).toHaveText('2');
});

test('sound toggle and mode navigation work', async ({ page }) => {
  await page.locator('#soundBtn').click();
  await expect(page.locator('#soundBtn')).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Speed Mode' }).click();
  await expect(page.locator('#timerContainer')).not.toHaveClass(/is-hidden/);
  await page.getByRole('button', { name: 'Sound Game' }).click();
  await expect(page.getByRole('button', { name: 'Play Animal Sound' })).toBeVisible();
});

test('habitat mode renders drop zones and supports dragging a correct card', async ({ page }) => {
  await page.getByRole('button', { name: 'Habitat Match' }).click();
  await expect(page.locator('.drop-zone')).toHaveCount(4);
  await expect(page.locator('.animal-card')).toHaveCount(18);
  const firstCard = page.locator('.animal-card').first();
  const habitat = await firstCard.getAttribute('data-habitat');
  await firstCard.dragTo(page.locator(`.drop-zone[data-habitat="${habitat}"]`));
  await expect(page.locator(`.drop-zone[data-habitat="${habitat}"] .animal-card`).first()).toBeVisible();
});
