import { test, expect } from '@playwright/test';

test.describe('Central de Moderação KYC E2E', () => {
  test('deve navegar até a central de moderação KYC e auditar documentos de prestador', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('Painel de Gestão')).toBeVisible();

    // Clica no botão de Moderação KYC
    await page.getByRole('link', { name: /Moderação KYC/i }).click();
    await expect(page).toHaveURL('/admin/kyc');

    // Valida elementos da tela de KYC
    await expect(page.getByText('Central de Moderação KYC')).toBeVisible();
    await expect(page.getByText('Fila de Solicitações')).toBeVisible();

    // Seleciona o primeiro prestador da lista
    await page.getByText('Carlos Andrade de Lima').click();
    await expect(page.getByText('Documentos Enviados para Auditoria')).toBeVisible();

    // Aprova o prestador
    await page.getByRole('button', { name: /Aprovar Prestador/i }).click();
    await expect(page.getByText(/Prestador aprovado com sucesso/i)).toBeVisible();
  });

  test('deve permitir rejeitar documentação com motivo', async ({ page }) => {
    await page.goto('/admin/kyc');

    // Seleciona o segundo prestador
    await page.getByText('Marcio Silva Tavares').click();

    // Clica no botão de Rejeitar
    await page.getByRole('button', { name: /Rejeitar/i }).click();
    await expect(page.getByText('Rejeitar Documentação')).toBeVisible();

    // Confirma rejeição
    await page.getByRole('button', { name: /Confirmar Rejeição/i }).click();
    await expect(page.getByText(/Documentação recusada/i)).toBeVisible();
  });
});

