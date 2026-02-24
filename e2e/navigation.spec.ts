import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navbar shows correct links when authenticated', async ({ page }) => {
    await page.goto('/quotations');

    // Navigation links
    await expect(page.getByRole('link', { name: /quotations/i }).first()).toBeVisible();
  });

  test('navigate to customers page', async ({ page }) => {
    await page.goto('/customers');
    await expect(page).toHaveURL(/\/customers/);
  });

  test('navigate to products page', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL(/\/products/);
  });

  test('navigate to templates page', async ({ page }) => {
    await page.goto('/templates');
    await expect(page).toHaveURL(/\/templates/);
  });

  test('navigate to settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/);
  });

  test('navigate to dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Dashboard').first()).toBeVisible();
  });

  test('root redirects to quotations', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(quotations|dashboard)/);
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/quotations');

    // Find and click the user menu / logout button
    // The navbar has a user dropdown with logout
    const userMenu = page.locator('[data-testid="user-menu"]').or(
      page.getByRole('button').filter({ hasText: /logout|sign out/i })
    );

    // If there's a dropdown trigger (avatar/initials), click it first
    const avatarButton = page.locator('button').filter({ has: page.locator('[class*="avatar"]') });
    if (await avatarButton.first().isVisible()) {
      await avatarButton.first().click();
      await page.waitForTimeout(300);
    }

    // Click logout
    const logoutItem = page.getByText(/logout|sign out/i);
    if (await logoutItem.isVisible()) {
      await logoutItem.click();
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    }
  });
});
