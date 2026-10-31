import { test, expect } from '@playwright/test';

test.describe('Tracking Flow E2E', () => {
  test('should navigate from checkout to tracking and display status', async ({ page }) => {
    await page.goto('/checkout/1');
    await expect(page.getByText(/Localizando Prestadores/i)).toBeVisible();

    // Acelera a busca de demonstração
    await page.locator('text=Acelerar busca').click();
    await expect(page.getByText(/Prestador Confirmado/i)).toBeVisible();

    // Clica para acompanhar deslocamento
    await page.locator('a[href*="/tracking/"]').click();
    await expect(page).toHaveURL(/\/tracking\/1/);
    await expect(page.getByText(/Garantia FACILITA|Serviço #/i).first()).toBeVisible();
    await expect(page.getByText(/João Silva/i).first()).toBeVisible();
  });
});
