import { test, expect } from '@playwright/test';

test.describe('Página Oficial de Download do App do Prestador E2E', () => {
  test('deve renderizar a landing page de download com botão APK, QR Code e passos do Android', async ({ page }) => {
    // 1. Acessa a rota de download diretamente
    await page.goto('/download');

    // 2. Valida elementos principais da Hero Section
    await expect(page.getByRole('heading', { name: /Baixe o FACILITA Prestador/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Distribuição Oficial do Prestador')).toBeVisible();
    await expect(page.getByText('Android 8.0+')).toBeVisible();

    // 3. Valida o botão de download direto do APK
    const downloadBtn = page.getByTestId('btn-download-apk');
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toHaveAttribute('href', '/downloads/facilita-provider.apk');
    await expect(downloadBtn).toHaveAttribute('download', 'facilita-provider.apk');

    // Clica no botão e valida feedback de início do download
    await downloadBtn.click();
    await expect(page.getByTestId('download-feedback-banner')).toBeVisible();
    await expect(page.getByText(/Download iniciado! Verifique a barra de notificações/i)).toBeVisible();

    // 4. Valida a presença do QR Code para escaneamento móvel
    const qrContainer = page.getByTestId('qr-code-container');
    await expect(qrContainer).toBeVisible();
    await expect(page.getByText(/Escanear pelo Celular/i)).toBeVisible();

    // 5. Valida os 4 passos ilustrados de instalação do Android
    const stepsContainer = page.getByTestId('install-steps-container');
    await expect(stepsContainer).toBeVisible();
    await expect(stepsContainer.getByText('Baixe o APK')).toBeVisible();
    await expect(stepsContainer.getByText('Permita a Instalação')).toBeVisible();
    await expect(stepsContainer.getByText('Toque em Instalar')).toBeVisible();
    await expect(stepsContainer.getByText('Faça Login')).toBeVisible();
  });

  test('deve redirecionar de /provider/download para /download', async ({ page }) => {
    await page.goto('/provider/download');
    await expect(page).toHaveURL('/download', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Baixe o FACILITA Prestador/i })).toBeVisible();
  });

  test('deve navegar para a página de download a partir do link no rodapé da Home', async ({ page }) => {
    await page.goto('/');
    const downloadFooterLink = page.getByRole('link', { name: /Baixar App do Prestador/i });
    await expect(downloadFooterLink).toBeVisible();
    await downloadFooterLink.click();

    await expect(page).toHaveURL('/download', { timeout: 10000 });
    await expect(page.getByTestId('btn-download-apk')).toBeVisible();
  });
});
