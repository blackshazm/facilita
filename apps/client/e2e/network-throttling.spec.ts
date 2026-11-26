import { test, expect } from '@playwright/test';

test.describe('Resiliência sob Throttling de Rede (Latência 1.500ms) E2E', () => {
  test('deve exibir Skeleton pulsante e travar duplo clique sob rede 3G degradada', async ({ page }) => {
    // 1. Intercepta requisição de busca do pedido adicionando latência artificial de 1.500ms
    await page.route('**/api/orders/ord-test-throttle', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'ord-test-throttle',
          status: 'IN_PROGRESS',
          totalAmount: 140.0,
          customer: { name: 'Cliente Teste' },
        }),
      });
    });

    // 2. Inicia a navegação para o tracking
    const navigationPromise = page.goto('/tracking/ord-test-throttle');

    // 3. Valida que o Skeleton pulsante é exibido imediatamente durante o throttling de rede
    const skeleton = page.getByTestId('tracking-skeleton');
    await expect(skeleton).toBeVisible({ timeout: 5000 });

    // Aguarda o término da navegação e resposta da API com delay
    await navigationPromise;

    // 4. Após o delay de 1.500ms, o painel real deve estar renderizado
    await expect(page.getByText('Serviço #ord-test-t')).toBeVisible({ timeout: 15000 });
    await expect(skeleton).not.toBeVisible();

    // 5. Simula cancelamento com lentidão de 1.500ms no POST para validar prevenção de duplo clique
    await page.route('**/api/orders/ord-test-throttle/cancel', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, status: 'CANCELED' }),
      });
    });

    const cancelBtn = page.getByTestId('btn-cancel-service');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    const cancelModal = page.getByTestId('cancel-modal');
    await expect(cancelModal).toBeVisible();

    const confirmCancelBtn = cancelModal.getByTestId('btn-confirm-cancel');
    await expect(confirmCancelBtn).toBeVisible();
    await confirmCancelBtn.click();

    // Verifica que o botão fica desabilitado e em loading state contra duplo clique
    await expect(confirmCancelBtn).toBeDisabled();
    await expect(confirmCancelBtn.getByText('Processando...')).toBeVisible();

    // Aguarda conclusão e redirecionamento final com sucesso
    await expect(page.getByTestId('cancel-success-message')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL('/orders', { timeout: 15000 });
  });
});
