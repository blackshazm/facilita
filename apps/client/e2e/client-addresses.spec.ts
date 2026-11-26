import { test, expect } from '@playwright/test';

test.describe('Gerenciamento e Seleção de Endereços Salvos E2E', () => {
  test('deve gerenciar endereços no perfil e utilizá-los no fluxo de novo pedido', async ({ page }) => {
    // 1. Acessa o perfil do cliente
    await page.goto('/profile');
    await expect(page.getByText('Endereços Salvos')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Av. Paulista, 1000')).toBeVisible();

    // 2. Abre modal para cadastrar novo endereço
    await page.getByRole('button', { name: /Novo Endereço/i }).click();
    await expect(page.getByText('Cadastrar Novo Endereço')).toBeVisible();

    // Preenche o formulário do endereço usando os placeholders corretos
    await page.getByPlaceholder('Ex: Av. Paulista').fill('Alameda Santos');
    await page.getByPlaceholder('1000').fill('500');
    await page.getByPlaceholder('Bela Vista').fill('Cerqueira César');
    await page.getByPlaceholder('01310-100').fill('01418-000');
    await page.getByRole('button', { name: /Salvar Endereço/i }).click();

    // Valida notificação de sucesso e presença na lista
    await expect(page.getByText(/Endereço adicionado com sucesso/i)).toBeVisible();
    await expect(page.getByText('Alameda Santos, 500')).toBeVisible();

    // 3. Navega para criar um novo pedido
    await page.goto('/new-order');
    await expect(page.getByText('Endereço do Atendimento')).toBeVisible({ timeout: 10000 });

    // Verifica que o novo endereço cadastrado aparece no seletor de 1-clique
    await expect(page.getByText('Alameda Santos, 500')).toBeVisible();

    // Seleciona o endereço da Alameda Santos
    await page.getByText('Alameda Santos, 500').click();

    // Verifica que o resumo da ordem exibe o endereço selecionado
    const summaryAddress = page.getByTestId('summary-address');
    await expect(summaryAddress).toContainText('Alameda Santos, 500');

    // 4. Testa a opção de informar outro endereço avulso
    await page.getByTestId('btn-custom-address').click();
    await page.getByPlaceholder('Ex: Rua Oscar Freire').fill('Rua Bela Cintra');
    await page.getByPlaceholder('Ex: Apto 42, Bloco B').fill('Apto 101');
    await page.getByPlaceholder('Pinheiros').fill('Consolação');

    // Verifica atualização em tempo real no resumo
    await expect(summaryAddress).toContainText('Rua Bela Cintra');

    // 5. Finaliza pedido com o endereço customizado
    await page.getByRole('button', { name: /Avançar para Pagamento/i }).click();

    // Confirma redirecionamento para o checkout com destino persistido
    await expect(page).toHaveURL(/\/checkout\/ord-/, { timeout: 15000 });
    await expect(page.getByText(/Localizando Prestadores/i)).toBeVisible();
    await expect(page.getByText('Rua Bela Cintra')).toBeVisible();
  });
});
