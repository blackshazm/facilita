import { test, expect } from '@playwright/test';

test.describe('Fluxo de Cancelamento Assistido com Taxa de Deslocamento E2E', () => {
  test('deve validar regras de cancelamento gratuito (<5min) e com retenção da taxa de deslocamento no tracking', async ({ page }) => {
    // 1. Acessa a tela de rastreamento do serviço
    await page.goto('/tracking/ord-test-cancel');
    await expect(page.getByText('Serviço #ord-test-c')).toBeVisible({ timeout: 15000 });

    // 2. Abre o modal de cancelamento em status inicial "A Caminho" (dentro da tolerância)
    const cancelBtn = page.getByTestId('btn-cancel-service');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    const cancelModal = page.getByTestId('cancel-modal');
    await expect(cancelModal).toBeVisible();

    // Valida que exibe estorno de 100% gratuito
    await expect(cancelModal.getByText(/Cancelamento Gratuito \(Estorno de 100%\)/i)).toBeVisible();
    await expect(cancelModal.getByText('R$ 140.00')).toBeVisible();

    // Fecha o modal para simular chegada do prestador
    await cancelModal.getByRole('button', { name: 'Voltar' }).click();
    await expect(cancelModal).not.toBeVisible();

    // 3. Simula mudança de status para "No Local" (prestador chegou)
    await page.getByRole('button', { name: /No Local/i }).click();

    // 4. Abre o modal novamente -> agora deve aplicar a retenção de R$ 35 da taxa de deslocamento
    await cancelBtn.click();
    await expect(cancelModal).toBeVisible();

    await expect(cancelModal.getByText(/Retenção da Taxa de Deslocamento \(R\$ 35,00\)/i)).toBeVisible();
    await expect(cancelModal.getByText('R$ 105.00')).toBeVisible();

    // 5. Confirma o cancelamento
    await cancelModal.getByTestId('btn-confirm-cancel').click();

    // Valida mensagem de sucesso e estorno com taxa
    await expect(page.getByTestId('cancel-success-message')).toBeVisible();
    await expect(page.getByText(/Taxa de deslocamento de R\$ 35,00 retida/i)).toBeVisible();

    // Redireciona para o histórico de pedidos
    await expect(page).toHaveURL('/orders', { timeout: 15000 });
  });
});
