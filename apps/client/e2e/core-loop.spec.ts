import { test, expect } from '@playwright/test';

test.describe('Tracking Flow E2E', () => {
  test('should navigate from checkout to tracking and display status', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout/1');

    // Should see searching state initially
    await expect(page.locator('text=Buscando o melhor prestador')).toBeVisible();

    // After 5 seconds, should transition to found state
    // We increase timeout here to account for the setTimeout in the component
    await expect(page.locator('text=Prestador Encontrado')).toBeVisible({ timeout: 6000 });
    
    // Click button to navigate to tracking
    await page.click('button:has-text("Acompanhar Deslocamento")');

    // Should be on tracking page
    await expect(page).toHaveURL(/\/tracking\/1/);

    // Verify Tracking UI elements
    await expect(page.locator('text=Acompanhar Serviço')).toBeVisible();
    await expect(page.locator('text=Status do Pedido')).toBeVisible();
    
    // Verify default status is A Caminho
    const aCaminhoText = page.locator('text=Prestador a caminho');
    await expect(aCaminhoText).toBeVisible();
  });
});
