param (
    [string]$Platform = "android",
    [string]$Profile = "preview"
)

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "📱 FACILITA Prestador — Iniciando Build Mobile via Expo EAS" -ForegroundColor Cyan
Write-Host "Plataforma: $Platform" -ForegroundColor Yellow
Write-Host "Perfil:     $Profile (preview = .apk instalavel | production = .aab loja)" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan

Set-Location "$PSScriptRoot/../apps/provider"

if (-not (Get-Command "eas" -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ EAS CLI nao encontrada. Instalando globalmente via npm..." -ForegroundColor Yellow
    npm install -g eas-cli
}

Write-Host "🚀 Disparando build na nuvem da Expo..." -ForegroundColor Green
eas build --platform $Platform --profile $Profile

Write-Host "✅ Build finalizado! Acesse o link retornado pela Expo para baixar os binarios." -ForegroundColor Green

