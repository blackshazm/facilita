import { test, expect } from '@playwright/test';

test.describe('Provider Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/provider/dashboard');
  });

  test('should accept an urgent service request and complete flow', async ({ page }) => {
    // 1. Valida elementos principais do painel do prestador
    await expect(page.getByText('João Silva')).toBeVisible();
    await expect(page.getByText(/ONLINE|Novo Chamado/i).first()).toBeVisible();

    // 2. Aceita o chamado
    const acceptBtn = page.getByRole('button', { name: /Aceitar Chamado/i });
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    // 3. Valida transição para "A caminho / Em Deslocamento"
    await expect(page.getByText(/Em Deslocamento|A Caminho/i).first()).toBeVisible();

    // 4. Confirma chegada no local
    const arrivedBtn = page.getByRole('button', { name: /Cheguei/i });
    await expect(arrivedBtn).toBeVisible();
    await arrivedBtn.click();

    // 5. Conclui o serviço
    const completeBtn = page.getByRole('button', { name: /Finalizar e Solicitar Repasse/i });
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();

    // 6. Valida estado final de serviço concluído
    await expect(page.getByText(/Serviço Concluído com Sucesso/i)).toBeVisible();
  });
});
