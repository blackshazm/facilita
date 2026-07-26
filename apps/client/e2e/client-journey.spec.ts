import { test, expect } from '@playwright/test';

test.describe('Jornada do Cliente E2E', () => {
  test('deve realizar cadastro de cliente, criar novo pedido, realizar checkout e acompanhar serviço', async ({ page }) => {
    // 1. Acesso à página de cadastro de cliente
    await page.goto('/register');
    await expect(page.getByText('FACILITA')).toBeVisible();
    await expect(page.getByText('Crie sua conta de cliente em poucas etapas')).toBeVisible();

    // Etapa 1: Telefone
    await page.getByPlaceholder('(11) 99999-9999').fill('11988887777');
    await page.getByRole('button', { name: 'Enviar Código de Verificação' }).click();

    // Etapa 2: OTP
    await expect(page.getByText('Digite o código de 6 dígitos enviado por SMS')).toBeVisible();
    await page.getByPlaceholder('123456').fill('123456');
    await page.getByRole('button', { name: 'Confirmar e Continuar' }).click();

    // Etapa 3: Dados Pessoais
    await expect(page.getByText('Informações Pessoais')).toBeVisible();
    await page.getByPlaceholder('Seu nome completo').fill('Maria Oliveira');
    await page.getByPlaceholder('seu@email.com').fill('maria@exemplo.com');
    await page.getByPlaceholder('Rua, número, bairro e cidade').fill('Av. Paulista, 1000 - São Paulo/SP');
    await page.getByRole('button', { name: 'Finalizar Cadastro' }).click();

    // 2. Redirecionamento para a criação de novo pedido
    await expect(page).toHaveURL('/new-order');
    await expect(page.getByText('Solicitar Novo Serviço')).toBeVisible();

    // Seleção de serviço e detalhes
    await page.getByText('Instalação de Tomada / Interruptor').click();
    await page.getByPlaceholder('Ex: Tomada da cozinha parou de funcionar após curto-circuito no micro-ondas.').fill('Troca de tomada da cozinha com vazamento de corrente.');
    
    // Envio da solicitação
    await page.getByRole('button', { name: /Confirmar e Buscar Eletricista/i }).click();

    // 3. Redirecionamento para Checkout
    await expect(page).toHaveURL(/\/checkout\/ord-/);
    await expect(page.getByText('Buscando o melhor prestador...')).toBeVisible();

    // Aguarda transição para "Prestador Encontrado!"
    await expect(page.getByText('Prestador Encontrado!')).toBeVisible({ timeout: 7000 });
    await expect(page.getByText('João Silva')).toBeVisible();
    await expect(page.getByText('4.9')).toBeVisible();

    // 4. Navegação para Acompanhamento (Tracking)
    await page.getByRole('button', { name: 'Acompanhar Deslocamento' }).click();

    await expect(page).toHaveURL(/\/tracking\//);
    await expect(page.getByText(/Acompanhar Serviço/i)).toBeVisible();
    await expect(page.getByText('Status do Pedido')).toBeVisible();
    await expect(page.getByText('Prestador a caminho')).toBeVisible();
    await expect(page.getByText('João Silva')).toBeVisible();
  });
});
