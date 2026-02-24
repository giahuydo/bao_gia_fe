import { test as setup, expect } from '@playwright/test';
import path from 'path';

const STORAGE_STATE = path.join(__dirname, '.auth/user.json');

/**
 * Global auth setup — logs in with test account and saves storage state.
 * All other tests reuse this authenticated state.
 */
setup('authenticate', async ({ page }) => {
  // Generous timeout for first run (dev server compiles pages on-demand)
  setup.setTimeout(120_000);

  // Go to login page
  await page.goto('/login');
  await expect(page.getByText('Quotation Management')).toBeVisible();

  // Fill credentials
  await page.getByLabel('Email').fill('e2etest@baogia.vn');
  await page.getByLabel('Password').fill('TestPass123');

  // Submit
  await page.getByRole('button', { name: /sign in/i }).click();

  // Confirm login succeeded: navbar shows user name
  await expect(page.getByText('E2E Test')).toBeVisible({ timeout: 15_000 });

  // The Next.js client-side router.replace("/quotations") can get stuck
  // while the dev server compiles the target page. Instead of waiting for
  // the soft navigation, do a hard navigation to /quotations now that
  // we have the auth token in localStorage + cookie.
  await page.goto('/quotations', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page).toHaveURL(/\/quotations/);

  // Save signed-in state
  await page.context().storageState({ path: STORAGE_STATE });
});
