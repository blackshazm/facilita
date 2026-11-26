#!/usr/bin/env bash
set -e

# ==============================================================================
# FACILITA — SCRIPT DE BUILD DO APP MOBILE (EXPO EAS)
# ==============================================================================

PLATFORM=${1:-android}
PROFILE=${2:-preview}

echo "=================================================================="
echo "📱 FACILITA Prestador — Iniciando Build Mobile via Expo EAS"
echo "Plataforma: $PLATFORM"
echo "Perfil:     $PROFILE (preview = .apk instalável | production = .aab loja)"
echo "=================================================================="

cd "$(dirname "$0")/../apps/provider"

# Checar se a CLI do EAS está instalada
if ! command -v eas &> /dev/null; then
    echo "⚠️ EAS CLI não encontrada. Instalando localmente..."
    npm install -g eas-cli
fi

echo "🚀 Disparando build na nuvem da Expo..."
eas build --platform "$PLATFORM" --profile "$PROFILE"

echo "✅ Build finalizado com sucesso! Acesse o link retornado pela Expo para baixar os binários."

