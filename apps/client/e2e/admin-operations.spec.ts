import { test, expect } from '@playwright/test';

test.describe('Painel do Administrador E2E', () => {
  test('deve navegar pelo Dashboard Operacional e validar Métricas', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Título e Visão Geral
    await expect(page.locator('h2', { hasText: 'Overview' })).toBeVisible();

    // Valida exibição dos cartões de métricas operacionais
    await expect(page.getByText('Total Payouts')).toBeVisible();
    await expect(page.getByText('Average Rating')).toBeVisible();
    await expect(page.getByText('Dispute Ratio')).toBeVisible();
  });

  test('deve validar trava de segurança Halt Payouts com confirmação estrita', async ({ page }) => {
    await page.goto('/admin/dashboard');

    const haltButton = page.getByRole('button', { name: 'Halt Payouts' });
    await expect(haltButton).toBeVisible();
    await haltButton.click();

    // Modal de confirmação
    const dialogTitle = page.getByRole('heading', { name: 'Halt All Payouts' });
    await expect(dialogTitle).toBeVisible();

    // Botão de confirmação deve estar desabilitado até digitação exata
    const confirmButton = page.getByRole('button', { name: 'Halt', exact: true });
    await expect(confirmButton).toBeDisabled();

    // Digita confirmação
    await page.getByPlaceholder('CONFIRMAR').fill('CONFIRMAR');
    await expect(confirmButton).toBeEnabled();

    // Cancela para fechar a modal sem alterar o estado global de produção
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialogTitle).not.toBeVisible();
  });

  test('deve monitorar e gerenciar a página de Payouts', async ({ page }) => {
    await page.goto('/admin/payouts');

    // Valida elementos principais da página de Payouts
    await expect(page.getByText('Monitoramento de Payouts')).toBeVisible();
    await expect(page.getByText(/Aviso de Segurança/i)).toBeVisible();
    await expect(page.getByText(/Fila de Aprovação|Histórico/i).first()).toBeVisible();
  });

  test('deve executar alteração manual de Tier de Prestador (Tier Override)', async ({ page }) => {
    await page.goto('/admin/tiers');

    await expect(page.getByRole('heading', { name: 'Tier Management' })).toBeVisible();

    // Localiza prestador "João Silva" e clica no botão de Override Manual
    const overrideBtn = page.locator('tr').filter({ hasText: 'João Silva' }).getByRole('button', { name: 'Manual Override' });
    await overrideBtn.click();

    // Valida modal de Override
    await expect(page.getByRole('heading', { name: 'Manual Tier Override' })).toBeVisible();

    // Seleciona novo nível PRATA
    await page.locator('select').selectOption('PRATA');

    // Preenche o motivo de auditoria
    await page.locator('textarea').fill('Desempenho excelente verificado em auditoria técnica.');

    // Confirma no alert/dialog do navegador
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Confirm Override' }).click();

    // Verifica se a tabela refletiu o nível PRATA
    const joaoRow = page.locator('tr').filter({ hasText: 'João Silva' });
    await expect(joaoRow.locator('span', { hasText: 'PRATA' })).toBeVisible();
  });
});
