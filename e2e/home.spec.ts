import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('redirects to /quotations or /dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(quotations|dashboard)/);
  });
});
