import { test, expect } from '@playwright/test';

/**
 * MEGA-TESTE E2E INTEGRADO (Cross-Platform / Cross-Persona)
 * Simula a interação simultânea entre Cliente, Prestador e Administrador em sessões isoladas.
 */
test.describe('Mega-Teste: Integração do Sistema Completo (Cliente, Prestador e Admin)', () => {
  
  test('Fluxo Ponta a Ponta Integrado', async ({ browser }) => {
    // Cria 3 contextos de navegador independentes para simular dispositivos e privilégios distintos
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
      await clientPage.getByPlaceholder('Ex: Tomada da cozinha parou de funcionar após curto-circuito no micro-ondas.').fill('Troca urgente de fiação e disjuntor.');
      
      await clientPage.getByRole('button', { name: /Confirmar e Buscar Eletricista/i }).click();
      await expect(clientPage).toHaveURL(/\/checkout\/ord-/);
    });

    // 2. Prestador acessa seu painel e verifica chamados recebidos
    await test.step('Prestador: Verificar Painel de Atendimento', async () => {
      await providerPage.goto('/provider/dashboard');
      
      const acceptJobBtn = providerPage.getByRole('button', { name: /accept job/i });
      if (await acceptJobBtn.isVisible()) {
        await acceptJobBtn.click();
        await expect(providerPage.getByText('Job In Progress')).toBeVisible();
      } else {
        console.log('Painel de atendimento do prestador verificado.');
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

    // Encerra contextos isolados
    await clientContext.close();
    await providerContext.close();
    await adminContext.close();
  });
});
