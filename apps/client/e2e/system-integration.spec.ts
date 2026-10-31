import { test, expect } from '@playwright/test';

test.describe('Mega-Teste: Integração do Sistema Completo (Cliente, Prestador e Admin)', () => {
  
  test('Fluxo Ponta a Ponta Integrado', async ({ browser }) => {
    const clientContext = await browser.newContext();
    const providerContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const clientPage = await clientContext.newPage();
    const providerPage = await providerContext.newPage();
    const adminPage = await adminContext.newPage();

    // 1. Cliente cria uma solicitação de serviço
    await test.step('Cliente: Criar Solicitação de Serviço', async () => {
      await clientPage.goto('/new-order');
      await expect(clientPage.getByText('Solicitar Novo Serviço')).toBeVisible();

      await clientPage.getByText('Instalação de Tomada / Interruptor').click();
      await clientPage.locator('textarea').fill('Troca urgente de fiação e disjuntor.');
      
      await clientPage.getByRole('button', { name: /Avançar para Pagamento/i }).click();
      await expect(clientPage).toHaveURL(/\/checkout\/ord-/);
      await expect(clientPage.getByText(/Localizando Prestadores/i)).toBeVisible();
    });

    // 2. Prestador acessa seu painel e verifica chamados recebidos
    await test.step('Prestador: Verificar Painel de Atendimento', async () => {
      await providerPage.goto('/provider/dashboard');
      await expect(providerPage.getByText('João Silva')).toBeVisible();
      
      const acceptJobBtn = providerPage.getByRole('button', { name: /Aceitar Chamado/i });
      if (await acceptJobBtn.isVisible()) {
        await acceptJobBtn.click();
        await expect(providerPage.getByText(/Em Deslocamento|A Caminho/i).first()).toBeVisible();
      }
    });

    // 3. Administrador monitora o sistema e métricas de repasse no Dashboard
    await test.step('Admin: Verificar Métricas do Sistema e Payouts', async () => {
      await adminPage.goto('/admin/dashboard');
      await expect(adminPage.locator('h2', { hasText: 'Overview' })).toBeVisible();
      await expect(adminPage.getByText('Total Payouts')).toBeVisible();

      await adminPage.goto('/admin/payouts');
      await expect(adminPage.getByText('Monitoramento de Payouts')).toBeVisible();
    });

    await clientContext.close();
    await providerContext.close();
    await adminContext.close();
  });
});
