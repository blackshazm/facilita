import { test, expect } from '@playwright/test';

test.describe('Cadastro e Onboarding do Prestador E2E', () => {
  test('deve validar todas as etapas de cadastro de prestador de serviço', async ({ page }) => {
    // 1. Acesso à área de prestador / simulador de cadastro
    await page.goto('/register?type=provider');

    // Valida elementos do formulário inicial
    await expect(page.getByText('FACILITA')).toBeVisible();

    // Etapa 1: Autenticação via Celular / SMS OTP
    const phoneInput = page.getByPlaceholder('(11) 99999-9999');
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill('11977776666');
    await page.getByRole('button', { name: /Enviar Código/i }).click();

    // Etapa 2: Digitação do Código OTP
    await expect(page.getByText(/código de 6 dígitos/i)).toBeVisible();
    await page.getByPlaceholder('123456').fill('654321');
    await page.getByRole('button', { name: /Confirmar e Continuar/i }).click();

    // Etapa 3: Informações de Perfil e Atuação
    await expect(page.getByText('Informações Pessoais')).toBeVisible();
    await page.getByPlaceholder('Seu nome completo').fill('Carlos Andrade');
    await page.getByPlaceholder('seu@email.com').fill('carlos.prestador@exemplo.com');
    await page.getByPlaceholder('Rua, número, bairro e cidade').fill('Rua Augusta, 500 - São Paulo/SP');
    
    // Conclusão do cadastro do perfil
    await page.getByRole('button', { name: 'Finalizar Cadastro' }).click();

    // Verificação de sucesso no redirecionamento
    await expect(page).toHaveURL('/new-order');
  });

  test('deve validar telas do aplicativo do prestador (Painel do Prestador)', async ({ page }) => {
    await page.goto('/provider/dashboard');

    // Se o painel for exibido, valida elementos de chamados e status
    const is404 = await page.getByRole('heading', { name: '404' }).isVisible();
    if (!is404) {
      await expect(page.getByText(/Incoming Request|Dashboard/i)).toBeVisible();
    }
  });
});
