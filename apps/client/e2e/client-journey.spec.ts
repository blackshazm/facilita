import { test, expect } from '@playwright/test';

test.describe('Jornada do Cliente E2E', () => {
  test('deve realizar cadastro de cliente, criar novo pedido, realizar checkout e acompanhar serviço', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('FACILITA')).toBeVisible();

    // Etapa 1: Telefone
    await page.getByPlaceholder('(11) 99999-9999').fill('11988887777');
    await page.getByRole('button', { name: /Continuar com SMS/i }).click();

    // Etapa 2: OTP
    await expect(page.getByText(/código de 6 dígitos/i)).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder('123456').fill('123456');
    await page.getByRole('button', { name: /Confirmar Código/i }).click();

    // Etapa 3: Dados Pessoais
    await expect(page.getByPlaceholder(/Maria da Silva/i)).toBeVisible({ timeout: 10000 });
    await page.getByPlaceholder(/Maria da Silva/i).fill('Maria Oliveira');
    await page.getByPlaceholder(/maria@email.com/i).fill('maria@exemplo.com');
    await page.getByPlaceholder(/Rua Augusta/i).fill('Av. Paulista, 1000 - São Paulo/SP');
    await page.getByRole('button', { name: /Concluir e Fazer Pedido/i }).click();

    // 2. Redirecionamento para a criação de novo pedido
    await expect(page).toHaveURL('/new-order');
    await expect(page.getByText('Solicitar Novo Serviço')).toBeVisible();

    // Seleção de serviço e detalhes
    await page.getByText('Instalação de Tomada / Interruptor').click();
    await page.locator('textarea').fill('Troca de tomada da cozinha com vazamento de corrente.');
    
    // Envio da solicitação
    await page.getByRole('button', { name: /Avançar para Pagamento/i }).click();

    // 3. Redirecionamento para Checkout
    await expect(page).toHaveURL(/\/checkout\/ord-/);
    await expect(page.getByText(/Localizando Prestadores/i)).toBeVisible();

    // Acelera busca de demo
    await page.locator('text=Acelerar busca').click();
    await expect(page.getByText(/Prestador Confirmado/i)).toBeVisible();

    // 4. Acompanhar em tempo real
    await page.locator('a[href*="/tracking/"]').click();
    await expect(page).toHaveURL(/\/tracking\/ord-/);
    await expect(page.getByText(/Garantia FACILITA/i).first()).toBeVisible();
  });
});
