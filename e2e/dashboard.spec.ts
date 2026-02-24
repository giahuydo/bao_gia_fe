import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('dashboard page loads with stat cards', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('Dashboard').first()).toBeVisible();

    // Stat cards should be visible
    await expect(page.getByText(/total quotations/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/accepted revenue/i)).toBeVisible();
    await expect(page.getByText(/total customers/i)).toBeVisible();
    await expect(page.getByText(/total products/i)).toBeVisible();
    await expect(page.getByText(/acceptance rate/i)).toBeVisible();
    await expect(page.getByText(/conversion rate/i)).toBeVisible();
  });

  test('dashboard shows status breakdown section', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText(/quotations by status/i)).toBeVisible({ timeout: 10_000 });

    // Should show status badges
    const statusSection = page.locator('text=Quotations by Status').locator('..');
    await expect(statusSection).toBeVisible();
  });

  test('dashboard shows monthly trend section', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText(/monthly trend/i)).toBeVisible({ timeout: 10_000 });
  });

  test('dashboard shows recent quotations section', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText(/recent quotations/i)).toBeVisible({ timeout: 10_000 });
  });
});
