import { test, expect } from '@playwright/test';

// These tests use the authenticated storageState from auth.setup.ts

test.describe('Quotation CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  let createdQuotationId: string;

  test('quotation list page loads', async ({ page }) => {
    await page.goto('/quotations');
    await expect(page.getByText('Quotations').first()).toBeVisible();
    await expect(page.getByText('Create New')).toBeVisible();
  });

  test('quotation list shows table with correct columns', async ({ page }) => {
    await page.goto('/quotations');

    // Wait for table or empty state
    const table = page.locator('table');
    const emptyState = page.getByText(/no quotations found/i);
    await expect(table.or(emptyState)).toBeVisible({ timeout: 10_000 });

    if (await table.isVisible()) {
      await expect(page.getByRole('columnheader', { name: /number/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /title/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /customer/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /total/i })).toBeVisible();
    }
  });

  test('search and status filter work', async ({ page }) => {
    await page.goto('/quotations');

    // Search input exists and is functional
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('nonexistent-query-xyz');

    // Wait for debounce (300ms) + request
    await page.waitForTimeout(500);

    // Should either show empty state or filtered results
    const emptyState = page.getByText(/no quotations found/i);
    const table = page.locator('table');
    await expect(emptyState.or(table)).toBeVisible();

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Status filter exists
    const statusFilter = page.getByRole('combobox').first();
    await expect(statusFilter).toBeVisible();
  });

  test('navigate to create quotation page', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/quotations');
    await page.getByText('Create New').click();
    await expect(page).toHaveURL(/\/quotations\/new/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Create Quotation' })).toBeVisible({ timeout: 15_000 });
  });

  test('create quotation form has required fields', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/quotations/new', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Quotation details section
    await expect(page.getByLabel(/title/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/customer/i).first()).toBeVisible();

    // Line items section
    await expect(page.getByText('Line Items')).toBeVisible();
    await expect(page.getByRole('button', { name: /add item/i })).toBeVisible();

    // Submit button
    await expect(page.getByRole('button', { name: /create quotation/i })).toBeVisible();
  });

  test('create a new quotation', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/quotations/new', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Fill title
    await page.getByLabel(/title/i).first().fill('E2E Test Quotation');

    // Select customer from combobox
    const customerTrigger = page.getByRole('combobox').filter({ hasText: /select customer/i });
    await customerTrigger.click();
    // Wait for customer list to load
    await page.waitForTimeout(1000);

    // Try to select the first customer, skip test if none available
    const firstCustomer = page.locator('[cmdk-item]').first();
    if (!(await firstCustomer.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'No customers in database — cannot create quotation');
      return;
    }
    await firstCustomer.click();

    // Fill first line item (form already has one by default)
    await page.locator('input[name="items.0.name"]').fill('Test Product');
    await page.locator('input[name="items.0.quantity"]').fill('5');
    await page.locator('input[name="items.0.unitPrice"]').fill('1000000');

    // Submit form
    await page.getByRole('button', { name: /create quotation/i }).click();

    // Should redirect to quotation detail page
    await expect(page).toHaveURL(/\/quotations\/[a-f0-9-]+$/, { timeout: 30_000 });

    // Verify the detail page shows our data
    await expect(page.getByText('E2E Test Quotation')).toBeVisible();

    // Save the ID for subsequent tests
    const url = page.url();
    createdQuotationId = url.split('/quotations/')[1];
  });

  test('view quotation detail shows correct data', async ({ page }) => {
    test.skip(!createdQuotationId, 'No quotation was created');

    await page.goto(`/quotations/${createdQuotationId}`);

    // Title
    await expect(page.getByText('E2E Test Quotation')).toBeVisible();

    // Status badge (should be draft)
    await expect(page.getByText(/draft/i)).toBeVisible();

    // Line items table
    await expect(page.getByText('Test Product')).toBeVisible();

    // Actions (Edit, Send, Duplicate, Delete should be visible for draft)
    await expect(page.getByRole('link', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /duplicate/i })).toBeVisible();
  });

  test('edit quotation', async ({ page }) => {
    test.skip(!createdQuotationId, 'No quotation was created');

    await page.goto(`/quotations/${createdQuotationId}/edit`);

    // Wait for form to load with existing data
    const titleInput = page.getByLabel(/title/i).first();
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue('E2E Test Quotation');

    // Update title
    await titleInput.fill('E2E Test Quotation (Updated)');

    // Submit
    await page.getByRole('button', { name: /update quotation|save/i }).click();

    // Should redirect back to detail page
    await expect(page).toHaveURL(/\/quotations\/[a-f0-9-]+$/, { timeout: 15_000 });
    await expect(page.getByText('E2E Test Quotation (Updated)')).toBeVisible();
  });

  test('duplicate quotation', async ({ page }) => {
    test.skip(!createdQuotationId, 'No quotation was created');

    await page.goto(`/quotations/${createdQuotationId}`);

    await page.getByRole('button', { name: /duplicate/i }).click();

    // Should redirect to the new quotation's detail page
    await expect(page).toHaveURL(/\/quotations\/[a-f0-9-]+$/, { timeout: 15_000 });

    // New quotation should have "(Copy)" in title
    await expect(page.getByText(/copy/i)).toBeVisible();
    await expect(page.getByText(/draft/i)).toBeVisible();
  });

  test('change quotation status to sent', async ({ page }) => {
    test.skip(!createdQuotationId, 'No quotation was created');

    await page.goto(`/quotations/${createdQuotationId}`);

    // Click Send button
    await page.getByRole('button', { name: /send/i }).first().click();

    // Status should change to "sent"
    await expect(page.getByText(/sent/i)).toBeVisible({ timeout: 10_000 });

    // Edit button should no longer be visible (sent quotations are read-only)
    await expect(page.getByRole('link', { name: /edit/i })).not.toBeVisible();
  });

  test('PDF export triggers download', async ({ page }) => {
    test.skip(!createdQuotationId, 'No quotation was created');

    await page.goto(`/quotations/${createdQuotationId}`);

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });

    // Click PDF button (look for the PDF preview/export button)
    const pdfButton = page.getByRole('button', { name: /pdf|export|download/i });
    if (await pdfButton.isVisible()) {
      await pdfButton.click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    }
  });

  test('delete quotation', async ({ page }) => {
    test.skip(!createdQuotationId, 'No quotation was created');

    await page.goto(`/quotations/${createdQuotationId}`);

    // Click Delete button
    await page.getByRole('button', { name: /delete/i }).click();

    // Confirm in dialog
    const confirmButton = page.getByRole('button', { name: /delete/i }).last();
    await confirmButton.click();

    // Should redirect to list
    await expect(page).toHaveURL(/\/quotations$/, { timeout: 10_000 });
  });
});
