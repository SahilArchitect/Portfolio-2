import { expect, test } from '@playwright/test';

test('home has no horizontal scroll on a phone', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
});
