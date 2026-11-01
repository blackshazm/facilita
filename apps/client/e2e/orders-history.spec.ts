import { test, expect } from '@playwright/test';

test.describe('Histórico de Pedidos, Recibo Fiscal e Garantia 90d E2E', () => {
  test('deve listar pedidos, filtrar por status, emitir recibo e acionar garantia de 90 dias', async ({ page }) => {
    // 1. Acessa a página de histórico de pedidos
    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: 'Histórico de Pedidos' })).toBeVisible({ timeout: 15000 });

    // Verifica abas de filtro e lista de pedidos
    await expect(page.getByTestId('orders-filter-tabs')).toBeVisible();
    await expect(page.getByTestId('order-card-ord-1024')).toBeVisible();
    await expect(page.getByTestId('order-card-ord-1012')).toBeVisible();

    // 2. Filtra por "Concluídos"
    await page.getByRole('button', { name: 'Concluídos' }).click();
    await expect(page.getByTestId('order-card-ord-1012')).toBeVisible();
    await expect(page.getByTestId('order-card-ord-1024')).not.toBeVisible();

    // 3. Filtra por "Em Andamento"
    await page.getByRole('button', { name: 'Em Andamento' }).click();
    await expect(page.getByTestId('order-card-ord-1024')).toBeVisible();
    await expect(page.getByTestId('order-card-ord-1012')).not.toBeVisible();

    // Retorna para "Todos"
    await page.getByRole('button', { name: /Todos/ }).click();
    await expect(page.getByTestId('order-card-ord-1024')).toBeVisible();
    await expect(page.getByTestId('order-card-ord-1012')).toBeVisible();

    // 4. Busca por texto
    const searchInput = page.getByPlaceholder('Buscar por serviço ou ID...');
    await searchInput.fill('Chuveiro');
    await expect(page.getByTestId('order-card-ord-1012')).toBeVisible();
    await expect(page.getByTestId('order-card-ord-1024')).not.toBeVisible();

    // Limpa a busca
    await searchInput.fill('');
    await expect(page.getByTestId('order-card-ord-1024')).toBeVisible();

    // 5. Abre o Modal de Recibo / Comprovante Oficial
    await page.getByTestId('btn-receipt-ord-1012').click();
    const receiptModal = page.getByTestId('receipt-modal');
    await expect(receiptModal).toBeVisible();

    // Valida dados fiscais e garantia no recibo
    await expect(receiptModal.getByText('FACILITA TECNOLOGIA E SERVIÇOS LTDA')).toBeVisible();
    await expect(receiptModal.getByText('48.123.456/0001-99')).toBeVisible();
    await expect(receiptModal.getByText(/Taxa de Intermediação e Seguro Garantia Facilita \(15%\)/i)).toBeVisible();
    await expect(receiptModal.getByText(/Garantia Legal & Contratual Facilita \(90 Dias\)/i)).toBeVisible();
    await expect(receiptModal.getByText(/Autenticação Digital SHA-256/i)).toBeVisible();
    await expect(receiptModal.getByRole('button', { name: /Imprimir \/ Salvar PDF/i })).toBeVisible();

    // Fecha o modal de recibo
    await receiptModal.getByRole('button', { name: 'Fechar' }).click();
    await expect(receiptModal).not.toBeVisible();

    // 6. Aciona garantia de 90 dias
    await page.getByRole('button', { name: 'Garantia 90d' }).first().click();
    await expect(page.getByText('Acionar Garantia Facilita 90d')).toBeVisible();

    await page.getByPlaceholder(/A tomada instalada voltou a apresentar/i).fill('Chuveiro parou de esquentar após uso regular');
    await page.getByRole('button', { name: 'Confirmar Abertura de Garantia' }).click();

    // Valida mensagem de confirmação
    await expect(page.getByText(/Garantia acionada para o pedido/i)).toBeVisible();
  });
});
