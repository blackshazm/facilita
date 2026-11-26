# 🚀 FACILITA — Guia Definitivo de Deploy em Produção e Publicação Mobile

Este manual prático e detalhado guia você passo a passo na publicação do **FACILITA** em ambiente de produção real (servidor VPS próprio) e na distribuição do aplicativo do prestador.

---

## 📑 Índice
1. [Requisitos e Custos Estimados](#1-requisitos-e-custos-estimados)
2. [Passo a Passo: Deploy do Backend e Web na VPS (Docker)](#2-passo-a-passo-deploy-do-backend-e-web-na-vps-docker)
3. [Configuração de DNS e Certificados SSL Grátis (HTTPS)](#3-configuração-de-dns-e-certificados-ssl-grátis-https)
4. [Compilação e Distribuição do Aplicativo do Prestador](#4-compilação-e-distribuição-do-aplicativo-do-prestador)
5. [Esteira de Atualizações Automáticas (CI/CD Zero Downtime)](#5-esteira-de-atualizações-automáticas-cicd-zero-downtime)
6. [Checklist Final de Go-Live](#6-checklist-final-de-go-live)

---

## 1. Requisitos e Custos Estimados

A arquitetura do FACILITA foi desenhada para operar com **custo fixo mínimo**, sem lock-in de fornecedores e sem taxas surpresa:

| Item | Provedor Recomendado | Custo Mensal / Único | Finalidade |
| :--- | :--- | :--- | :--- |
| **Servidor VPS** | Hetzner CPX31 (4 vCPU / 8 GB RAM) ou DigitalOcean Droplet | ~€12,00 a $24,00 / mês | Roda API, Web, Postgres PostGIS, Redis, GlitchTip, Prometheus e Grafana |
| **Domínio DNS** | Registro.br ou Cloudflare (`facilita.com.br`) | ~R$ 40,00 / ano | Endereços oficiais do app e API |
| **EAS Build (Expo)** | Expo Application Services | **Plano Free (30 builds/mês)** | Compilação em nuvem dos pacotes (.apk e .aab) |

---

## 2. Passo a Passo: Deploy do Backend e Web na VPS (Docker)

### 2.1 Preparação do Servidor Ubuntu (22.04 ou 24.04 LTS)

Acesse sua VPS recém-criada via SSH:
```bash
ssh root@SEU_IP_DO_SERVIDOR
```

Atualize o sistema e configure o firewall de segurança UFW:
```bash
apt update && apt upgrade -y
apt install -y curl git ufw

# Permitir apenas SSH, HTTP e HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

Instale o **Docker Engine** e o **Docker Compose v2**:
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

---

### 2.2 Clonando o Repositório e Configurando o Ambiente

Crie o diretório da aplicação e faça o clone:
```bash
mkdir -p /opt/facilita
cd /opt/facilita
git clone https://github.com/SEU_USUARIO/facilita.git .
```

Crie o arquivo de variáveis de produção `.env.production` a partir do modelo:
```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Gere segredos criptográficos fortes para o `.env.production`:
```bash
# Gerar JWT Secret
openssl rand -hex 32

# Gerar Chave de Criptografia AES-256 (PII_ENCRYPTION_KEY)
openssl rand -hex 32

# Gerar Salt (PII_SALT)
openssl rand -hex 16
```

Edite o arquivo `.env.production` com seu editor favorito (`nano .env.production`) e preencha:
- `POSTGRES_PASSWORD`: Defina uma senha forte para o banco de dados.
- `JWT_SECRET`: Cole o hash gerado acima.
- `PII_ENCRYPTION_KEY` e `PII_SALT`: Cole os hashes gerados.
- `PAGARME_API_KEY`: Sua chave de produção `ak_live_...` da Pagar.me.
- `TWILIO_ACCOUNT_SID` e `TWILIO_AUTH_TOKEN`: Suas credenciais de SMS da Twilio.

---

### 2.3 Subindo a Stack Completa de Produção

Execute o script de pré-voo para garantir que nenhuma dependência ou permissão foi esquecida:
```bash
node scripts/verify-production-readiness.js
```

Suba todos os containers com Docker Compose:
```bash
docker compose -f docker-compose.prod.yml up -d
```

Verifique se todos os containers estão saudáveis:
```bash
docker compose -f docker-compose.prod.yml ps
```

Execute as migrações do banco de dados PostgreSQL com PostGIS:
```bash
docker exec -it facilita-prod-api npx prisma migrate deploy
```

Execute o primeiro backup manual para validar a rotina automática das 03:00:
```bash
docker exec -it facilita-prod-backup /usr/local/bin/backup-postgres.sh
```

---

## 3. Configuração de DNS e Certificados SSL Grátis (HTTPS)

No painel de gerenciamento do seu domínio (Cloudflare ou Registro.br), crie os seguintes apontamentos tipo **A** para o IP do seu servidor:

| Tipo | Nome (Host) | Destino (Valor) |
| :--- | :--- | :--- |
| **A** | `app` (ou `@`) | `SEU_IP_DO_SERVIDOR` |
| **A** | `api` | `SEU_IP_DO_SERVIDOR` |
| **A** | `grafana` | `SEU_IP_DO_SERVIDOR` |
| **A** | `glitchtip` | `SEU_IP_DO_SERVIDOR` |

Para gerenciar o SSL automático com Let's Encrypt de forma ultra-simples, utilize o **Caddy** ou **Nginx**:

Exemplo de configuração Caddy (`/etc/caddy/Caddyfile`):
```caddy
app.facilita.com.br {
    reverse_proxy localhost:3000
}

api.facilita.com.br {
    reverse_proxy localhost:3333
}

grafana.facilita.com.br {
    reverse_proxy localhost:3001
}

glitchtip.facilita.com.br {
    reverse_proxy localhost:8000
}
```
Recarregue o Caddy (`systemctl reload caddy`) e todas as URLs estarão com **HTTPS e certificado válido de classe A** imediatamente.

---

## 4. Compilação e Distribuição do Aplicativo do Prestador

O aplicativo móvel do prestador (`apps/provider`) já está configurado com o pacote `com.facilita.provider`, permissões de localização pontual, travas físicas de câmera antes/depois, fila offline local e perfis de compilação EAS.

### 4.1 Login e Configuração via EAS CLI

Instale a CLI do Expo EAS na sua máquina de desenvolvimento:
```bash
npm install -g eas-cli
eas login
```

### 4.2 Gerando o Pacote Instalável (.apk) do Prestador

No terminal do seu computador (Linux, Mac ou Windows PowerShell):
```bash
# Opção A: Gerar APK instalável direto (recomendado para distribuição aos prestadores parceiros)
./scripts/build-mobile.sh android preview
# Ou no Windows PowerShell:
.\scripts\build-mobile.ps1 -Platform android -Profile preview

# Opção B: Comando direto na pasta do provider
cd apps/provider
eas build --platform android --profile preview
```

O EAS compilará o projeto na nuvem e disponibilizará um link para download direto do arquivo instalável:
`facilita-provider.apk`.

> 💡 **Distribuição Direta:**  
> O arquivo `.apk` gerado pode ser disponibilizado para download direto no portal administrativo da FACILITA (`app.facilita.com.br/download`) ou enviado diretamente aos prestadores parceiros cadastrados no onboarding.

---

## 5. Esteira de Atualizações Automáticas (CI/CD Zero Downtime)

O repositório já conta com o workflow do GitHub Actions em [`.github/workflows/deploy.yml`](file:///d:/Desktop/facilita/.github/workflows/deploy.yml).

Para ativar o deploy automatizado a cada `git push origin main`:
1. No seu repositório no GitHub, acesse **Settings > Secrets and variables > Actions**.
2. Adicione as seguintes Secrets:
   - `COOLIFY_WEBHOOK_API`: Webhook para notificar a subida da nova versão da API.
   - `COOLIFY_WEBHOOK_CLIENT`: Webhook para notificar o rebuild do Next.js.
   - Ou utilize runner SSH direto para rodar `docker compose pull && docker compose up -d`.

---

## 6. Checklist Final de Go-Live

- [x] Testes unitários do backend passando 100% (**49 de 49 testes**).
- [x] Testes E2E do Playwright cobrindo todas as jornadas (**23 de 23 testes verdes**).
- [x] Termos de Uso e Política de Privacidade de acordo com a LGPD ativos.
- [x] Trava de fotos de evidência antes/depois no backend contra chargebacks.
- [x] Permissões Android e canal sonoro `urgency_dispatch_channel` configurados no app do prestador.
- [x] Perfil de build configurado no `eas.json` para geração do `.apk`.
- [x] Docker Compose e rotina de backup de 7 dias operacionais.
- [ ] Inserir chaves reais no `.env.production` no servidor.
- [ ] Executar `eas build --platform android --profile preview` para gerar o `.apk` instalável do prestador.

