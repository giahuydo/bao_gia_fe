import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  // These tests run WITHOUT the global auth state
  test.use({ storageState: { cookies: [], origins: [] } });

  test('redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/quotations');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows login form with correct elements', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('Quotation Management')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByText('Register')).toBeVisible();
  });

  test('shows validation error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@email.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message in the error div
    await expect(page.locator('.bg-destructive\\/10')).toBeVisible({ timeout: 10_000 });
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('successful login redirects to /quotations', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('e2etest@baogia.vn');
    await page.getByLabel('Password').fill('TestPass123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/quotations/, { timeout: 15_000 });
  });

  test('register page loads with correct elements', async ({ page }) => {
    // Increase timeout — dev server may need to compile register page
    test.setTimeout(45_000);

    await page.goto('/register', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    await expect(page.getByText('Create Account').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('register shows error for duplicate email', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('e2etest@baogia.vn');
    await page.getByLabel('Password', { exact: true }).fill('TestPass123');
    await page.getByLabel('Confirm Password').fill('TestPass123');
    await page.getByRole('button', { name: /create account/i }).click();

    // Error message shows in a destructive div — use specific selector to avoid matching "Email" label
    await expect(page.locator('.bg-destructive\\/10')).toBeVisible({ timeout: 10_000 });
  });

  test('navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Register').click();
    await expect(page).toHaveURL(/\/register/);

    await page.getByText('Sign in').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
