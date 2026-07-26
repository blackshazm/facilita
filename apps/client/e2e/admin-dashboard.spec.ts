import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/admin/dashboard');
  });

  test('should display operational dashboard metrics', async ({ page }) => {
    // Check if the dashboard title is visible
    await expect(page.locator('h2', { hasText: 'Overview' })).toBeVisible();

    // Check if the summary cards are rendering
    await expect(page.getByText('Total Payouts')).toBeVisible();
    await expect(page.getByText('Average Rating')).toBeVisible();
    await expect(page.getByText('Dispute Ratio')).toBeVisible();
  });

  test('should open Halt Payouts modal and validate confirmation', async ({ page }) => {
    const haltButton = page.getByRole('button', { name: 'Halt Payouts' });
    
    // Wait for the button to be visible and click
    await expect(haltButton).toBeVisible();
    await haltButton.click();

    // Verify the modal appears
    const dialogTitle = page.getByRole('heading', { name: 'Halt All Payouts' });
    await expect(dialogTitle).toBeVisible();

    // Verify confirm button is initially disabled
    const confirmButton = page.getByRole('button', { name: 'Halt', exact: true });
    await expect(confirmButton).toBeDisabled();

    // Type the confirmation text
    await page.getByPlaceholder('CONFIRMAR').fill('CONFIRMAR');
    
    // Now it should be enabled
    await expect(confirmButton).toBeEnabled();
    
    // Cancel to close
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});

test.describe('Admin Tiers Override E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/admin/tiers');
  });

  test('should perform manual tier override', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tier Management' })).toBeVisible();

    // Click Manual Override for João Silva
    const overrideBtn = page.locator('tr').filter({ hasText: 'João Silva' }).getByRole('button', { name: 'Manual Override' });
    await overrideBtn.click();

    // Wait for modal
    await expect(page.getByRole('heading', { name: 'Manual Tier Override' })).toBeVisible();

    // Change select to PRATA
    await page.locator('select').selectOption('PRATA');

    // Fill reason
    await page.locator('textarea').fill('Excellent performance verified manually.');

    // Confirm
    page.on('dialog', dialog => dialog.accept()); // handle the alert
    await page.getByRole('button', { name: 'Confirm Override' }).click();

    // Check if the UI updated (since we added React state for MOCK_PROVIDERS)
    const joaoRow = page.locator('tr').filter({ hasText: 'João Silva' });
    await expect(joaoRow.locator('span', { hasText: 'PRATA' })).toBeVisible();
  });
});
