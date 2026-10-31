import { test, expect } from '@playwright/test';

test.describe('Cadastro e Onboarding do Prestador E2E', () => {
  test('deve validar todas as etapas de cadastro de prestador de serviço', async ({ page }) => {
    await page.goto('/provider/register');

    await expect(page.getByText(/Cadastro de Prestador|Profissional FACILITA/i).first()).toBeVisible();
    await page.getByPlaceholder(/João Silva/i).fill('Carlos Andrade');
    await page.getByPlaceholder('000.000.000-00').fill('12345678909');
    await page.getByPlaceholder('(11) 99999-9999').fill('11977776666');
    await page.getByPlaceholder(/joao.silva@exemplo.com/i).fill('carlos.prestador@exemplo.com');
    
    // Avança para Especialidades
    await page.getByRole('button', { name: /Próximo: Especialidades/i }).click();

    // Etapa 2: Seleção de Especialidades & Categorias
    await expect(page.getByText(/Categorias & Raio de Atuação/i)).toBeVisible();
    await page.getByRole('button', { name: /Próximo: Dados Bancários/i }).click();

    // Etapa 3: Dados Bancários
    await expect(page.getByText(/Dados Bancários para Recebimento/i)).toBeVisible();
    await page.getByPlaceholder(/Informe sua chave PIX exata/i).fill('carlos.prestador@exemplo.com');
    await page.getByRole('button', { name: /Próximo: Documentos KYC/i }).click();

    // Etapa 4: Documentos KYC
    await expect(page.getByText(/Validação de Documentos/i)).toBeVisible();
    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'cnh_frente.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock-document-bytes')
    });
    await page.getByRole('button', { name: /Concluir Cadastro/i }).click();

    // Tela de Sucesso
    await expect(page.getByText(/Cadastro Enviado com Sucesso/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Ir para o Painel do Prestador/i }).click();

    // Redirecionamento para o Dashboard
    await expect(page).toHaveURL('/provider/dashboard');
  });

  test('deve validar telas do aplicativo do prestador (Painel do Prestador)', async ({ page }) => {
    await page.goto('/provider/dashboard');
    await expect(page.getByText('João Silva')).toBeVisible();
    await expect(page.getByText(/ONLINE|Status do Prestador/i).first()).toBeVisible();
  });
});
