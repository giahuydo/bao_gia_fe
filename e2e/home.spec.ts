import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('redirects to /quotations', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/quotations/);
  });

  test('has correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Bao Gia/);
  });
});
