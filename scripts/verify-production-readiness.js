#!/usr/bin/env node

/**
 * Script de Verificação de Pré-Voo de Produção do FACILITA
 * Executa checagem de consistência arquitetural, variáveis e configurações de build
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('🚀 [FACILITA] Checagem de Pré-Voo de Produção e Publicação');
console.log('================================================================\n');

let hasErrors = false;

// 1. Checar existência de arquivos de infraestrutura críticos
const criticalFiles = [
  'docker-compose.prod.yml',
  'apps/api/Dockerfile',
  'apps/client/Dockerfile',
  'apps/provider/app.json',
  'apps/provider/eas.json',
  '.github/workflows/deploy.yml',
  'scripts/backup-postgres.sh',
  'infra/prometheus.yml',
];

console.log('🔍 1. Validando arquivos de Infraestrutura e Build:');
criticalFiles.forEach((file) => {
  const fullPath = path.join(ROOT_DIR, file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file} presente`);
  } else {
    console.error(`   ❌ ERRO: Arquivo obrigatório ausente: ${file}`);
    hasErrors = true;
  }
});

// 2. Validar app.json do Mobile (Expo / EAS)
console.log('\n📱 2. Validando configurações do App Mobile (apps/provider/app.json):');
try {
  const appJsonPath = path.join(ROOT_DIR, 'apps/provider/app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')).expo;

  if (appJson.android?.package === 'com.facilita.provider') {
    console.log(`   ✅ Android Package: ${appJson.android.package}`);
  } else {
    console.error('   ❌ Android Package inválido ou não configurado');
    hasErrors = true;
  }

  const requiredAndroidPermissions = [
    'ACCESS_FINE_LOCATION',
    'ACCESS_BACKGROUND_LOCATION',
    'FOREGROUND_SERVICE',
    'POST_NOTIFICATIONS',
    'CAMERA',
  ];

  requiredAndroidPermissions.forEach((perm) => {
    if (appJson.android?.permissions?.includes(perm)) {
      console.log(`   ✅ Permissão Android configurada: ${perm}`);
    } else {
      console.error(`   ❌ Permissão Android ausente em app.json: ${perm}`);
      hasErrors = true;
    }
  });

  if (appJson.ios?.bundleIdentifier === 'com.facilita.provider') {
    console.log(`   ✅ iOS Bundle Identifier: ${appJson.ios.bundleIdentifier}`);
  }

  if (appJson.ios?.infoPlist?.UIBackgroundModes?.includes('location')) {
    console.log('   ✅ iOS Background Mode Location configurado');
  }
} catch (err) {
  console.error(`   ❌ Falha ao validar app.json: ${err.message}`);
  hasErrors = true;
}

// 3. Validar eas.json do Mobile
console.log('\n📦 3. Validando perfis do EAS Build (apps/provider/eas.json):');
try {
  const easJsonPath = path.join(ROOT_DIR, 'apps/provider/eas.json');
  const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));

  if (easJson.build?.production?.android?.buildType === 'app-bundle') {
    console.log('   ✅ Perfil Production Android gera Google Play App Bundle (.aab)');
  } else {
    console.error('   ❌ Perfil Production Android deve ter buildType: "app-bundle"');
    hasErrors = true;
  }

  if (easJson.build?.preview?.android?.buildType === 'apk') {
    console.log('   ✅ Perfil Preview Android gera APK instalável para testes diretos (.apk)');
  }
} catch (err) {
  console.error(`   ❌ Falha ao validar eas.json: ${err.message}`);
  hasErrors = true;
}

// 4. Checar variáveis de ambiente no .env.production.example
console.log('\n🔐 4. Checando catálogo de variáveis de produção (.env.production.example):');
const envExamplePath = path.join(ROOT_DIR, '.env.production.example');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  const requiredVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'PAGARME_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'STREAM_IO_API_KEY',
    'NEXT_PUBLIC_API_URL',
  ];

  requiredVars.forEach((v) => {
    if (envContent.includes(v)) {
      console.log(`   ✅ Chave documentada: ${v}`);
    } else {
      console.error(`   ❌ Variável crítica não documentada no exemplo: ${v}`);
      hasErrors = true;
    }
  });
}

console.log('\n================================================================');
if (hasErrors) {
  console.error('❌ Pré-voo de produção encontrou inconsistências. Corrija antes do deploy.');
  process.exit(1);
} else {
  console.log('✨ SUCESSO: Todos os pré-requisitos de Produção e Mobile estão prontos!');
  console.log('================================================================\n');
  process.exit(0);
}

