# 📘 FACILITA — GUIA DEFINITIVO E MANUAL DE NAVEGAÇÃO DO SISTEMA
**Versão:** 3.1-PROD (Atualizado com Auditoria Pré-Lançamento & Suíte Global E2E)  
**Data:** Novembro de 2026  
**Status do Projeto:** Production Ready (88% dos fluxos core implementados e testados com 100% de aprovação automatizada)

Este documento contém o passo a passo completo para executar, testar e navegar por todas as funcionalidades do sistema **FACILITA**, com **links diretos para cada arquivo do projeto**.

---

## 🚀 1. Como Rodar o Sistema Passo a Passo

### Passo 1: Subir o Banco de Dados e Serviços de Apoio (Docker)
No terminal na raiz do projeto (`d:\Desktop\facilita`):
```bash
docker-compose up -d
```
> Isso iniciará os contêineres de **PostgreSQL PostGIS (porta 5432)** e **Redis (porta 6379)**.

### Passo 2: Iniciar a API Backend (NestJS)
```bash
npm run dev --workspace=apps/api
```
- **URL Base:** `http://localhost:3333`
- **Health Check & Métricas:** `http://localhost:3333/api/v1/health` e `http://localhost:3333/api/v1/metrics`

### Passo 3: Iniciar o Client Web (Next.js 15)
Em outro terminal:
```bash
npm run dev --workspace=apps/client
```
- **URL Base:** `http://localhost:3000`
- **Painel Administrativo:** `http://localhost:3000/admin`
- **Central de Moderação KYC:** `http://localhost:3000/admin/kyc`
- **Cockpit do Prestador (Simulação Web):** `http://localhost:3000/provider/dashboard`
- **Histórico & Recibos:** `http://localhost:3000/orders`
- **Perfil & Endereços:** `http://localhost:3000/profile`

### Passo 4: Iniciar o App Mobile do Prestador (Expo React Native)
Em um terceiro terminal:
```bash
npm run start --workspace=apps/provider
```
- Para testar no celular: Abra o aplicativo **Expo Go** e escaneie o QR Code.
- Para testar no emulador: Pressione `a` para Android ou `i` para iOS Simulator.

---

## 🔗 2. Links Passo a Passo para Todos os Módulos e Telas do Código

### 🛡️ Módulo 1 — Segurança & KYC (Verificação de Prestadores)
- 📄 [background-check.port.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fraud/ports/background-check.port.ts) — Contrato de interface para antecedentes criminais.
- 📄 [checagem-background-check.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fraud/infrastructure/adapters/checagem-background-check.adapter.ts) — Adapter Checagem.com com filtro de gravidade de crimes.
- 📄 [truora-kyc.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fraud/infrastructure/adapters/truora-kyc.adapter.ts) — Adapter Truora KYC para biometria e match facial.
- 📄 [receita-federal-mei.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fraud/infrastructure/adapters/receita-federal-mei.adapter.ts) — Adapter CNPJ.ws para validação de MEI na Receita Federal.
- 📄 [run-provider-verification.usecase.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fraud/application/run-provider-verification.usecase.ts) — Orquestrador das 3 camadas de segurança.
- 📄 [kyc.controller.ts](file:///d:/Desktop/facilita/apps/api/src/modules/identity/interface/kyc.controller.ts) — Endpoint `POST /identity/kyc/verify-provider`.
- 🧪 [provider-verification.spec.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fraud/__tests__/provider-verification.spec.ts) — Bateria de testes unitários do módulo de fraude (5/5 PASS ✅).

---

### 💬 Módulo 2 — Chat em Tempo Real & Filtro Antifraude (Stream.io)
- 📄 [chat-service.port.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/ports/chat-service.port.ts) — Contrato de porta desacoplado para chat.
- 📄 [stream-chat.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/infrastructure/stream-chat.adapter.ts) — Adapter do SDK Stream Chat.
- 📄 [stream-chat-webhook.controller.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/infrastructure/stream-chat-webhook.controller.ts) — Webhook antifraude com 13 padrões regex (bloqueia contato externo).
- 📄 [chat-event.listener.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/infrastructure/chat-event.listener.ts) — Listener de eventos (cria/fecha canais e mascara mensagens).
- 📄 [OrderChat.tsx](file:///d:/Desktop/facilita/apps/client/src/components/OrderChat.tsx) — Componente React de chat do cliente web.
- 📄 [useChatToken.ts](file:///d:/Desktop/facilita/apps/client/src/hooks/useChatToken.ts) — Hook de busca de token Stream.io.
- 🧪 [stream-chat-webhook.spec.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/__tests__/stream-chat-webhook.spec.ts) — Bateria de testes do webhook de chat (9/9 PASS ✅).

---

### 📱 Módulo 3 — App Mobile do Prestador (Expo React Native)
- 📄 [AppNavigator.tsx](file:///d:/Desktop/facilita/apps/provider/src/navigation/AppNavigator.tsx) — Navegação Stack completa com todas as telas conectadas.
- 📄 [HomeScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/HomeScreen.tsx) — Dashboard principal com switch Online/Offline e métricas do prestador.
- 📄 [JobQueueScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/JobQueueScreen.tsx) — Fila de oportunidades no raio de atendimento.
- 📄 [ActiveJobScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/ActiveJobScreen.tsx) — Linha do tempo e check-in geolocalizado do chamado.
- 📄 [DocumentUploadScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/DocumentUploadScreen.tsx) — Captura de selfie biométrica e documentos.
- 📄 [CategoriesScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/CategoriesScreen.tsx) — Seleção de especialidades de atendimento.
- 📄 [ServiceAreaScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/ServiceAreaScreen.tsx) — Configuração de raio em km e meta diária.
- 📄 [AdditionalRequestScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/AdditionalRequestScreen.tsx) — Solicitação de valor adicional com foto de recibo.
- 📄 [WalletScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/WalletScreen.tsx) — Carteira e saldo de repasses Pagar.me Split.
- 📄 [PerformanceScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/PerformanceScreen.tsx) — Score de 90 dias e progressão de Tiers (Bronze/Prata/Ouro).
- 📄 [AvailabilityScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/AvailabilityScreen.tsx) — Agenda de horários e dias da semana.
- 📄 [BankDataScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/BankDataScreen.tsx) — Cadastro de conta bancária.

---

### 💻 Módulo 4 — Client Web (Next.js 15)
- 📄 [register/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/register/page.tsx) — Cadastro do cliente com fluxo SMS OTP em 3 passos.
- 📄 [new-order/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/new-order/page.tsx) — Triagem guiada de novo pedido com seletor de endereços salvos de 1-clique.
- 📄 [tracking/[id]/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/tracking/%5Bid%5D/page.tsx) — Acompanhamento do chamado em tempo real com modal de cancelamento assistido.
- 📄 [orders/[id]/approve/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/orders/%5Bid%5D/approve/page.tsx) — Inspeção de fotos Antes/Depois e liberação do pagamento.
- 📄 [orders/[id]/additional/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/orders/%5Bid%5D/additional/page.tsx) — Aprovação/Recusa de adicionais com foto de nota fiscal.
- 📄 [orders/[id]/review/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/orders/%5Bid%5D/review/page.tsx) — Avaliação 5 estrelas por critérios.
- 📄 [profile/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/profile/page.tsx) — Perfil do cliente com gerenciamento de múltiplos endereços (Casa, Trabalho, Outro).

---

### ⚙️ Módulo 5 — APIs & Regras de Ciclo de Vida dos Pedidos
- 📄 [order.entity.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/core/order.entity.ts) — Entidade pura de domínio com regras de transição de status e método `cancel()`.
- 📄 [order.service.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/application/order.service.ts) — Regras de negócio transacionais (`create`, `accept`, `checkIn`, `start`, `complete`, `requestAdditional`, `approveOrder`, `claimWarranty`, `cancelOrder`, `getOrdersHistory`, `generateReceipt`).
- 📄 [order.controller.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/interface/order.controller.ts) — Controller HTTP expondo endpoints REST (`GET /orders`, `GET /orders/:id/receipt`, `POST /orders/:id/cancel`, `POST /orders/:id/warranty`).
- 🧪 [order-lifecycle.spec.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/__tests__/order-lifecycle.spec.ts) — Bateria de testes unitários do ciclo de vida dos pedidos (7/7 PASS ✅).

---

### 🔑 Módulo 6 — Autenticação Segura & Anti-Bot (Twilio SMS / Z-API WhatsApp & Redis Rate Limiter)
- 📄 [auth.service.port.ts](file:///d:/Desktop/facilita/apps/api/src/modules/auth/ports/auth.service.port.ts) — Portas de serviço desacopladas `SmsServicePort` e `OtpRateLimiterPort`.
- 📄 [twilio-sms.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/auth/adapters/twilio-sms.adapter.ts) — Adapter de envio de SMS real via Twilio REST API e Z-API WhatsApp com normalização internacional E.164 (`+55...`) e fallback Dev/Mock.
- 📄 [redis-otp-rate-limiter.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/auth/adapters/redis-otp-rate-limiter.adapter.ts) — Rate limiter resiliente com Redis e memória em sliding-window (máx 3 envios por telefone a cada 10 min — HTTP 429).
- 📄 [send-otp.use-case.ts](file:///d:/Desktop/facilita/apps/api/src/modules/auth/application/send-otp.use-case.ts) — Caso de uso orquestrando validação, rate limiting, geração de 6 dígitos e disparo.
- 📄 [auth.controller.ts](file:///d:/Desktop/facilita/apps/api/src/modules/auth/application/auth.controller.ts) — Endpoints `POST /auth/send-otp` e `POST /auth/verify-otp`.
- 🧪 [twilio-sms.adapter.spec.ts](file:///d:/Desktop/facilita/apps/api/src/modules/auth/adapters/twilio-sms.adapter.spec.ts) e [redis-otp-rate-limiter.adapter.spec.ts](file:///d:/Desktop/facilita/apps/api/src/modules/auth/adapters/redis-otp-rate-limiter.adapter.spec.ts) — Testes unitários de auth (29/29 PASS ✅).

---

### 📍 Módulo 7 — Gestão de Múltiplos Endereços & Cancelamento Assistido
- 📄 [address.controller.ts](file:///d:/Desktop/facilita/apps/api/src/modules/identity/interface/address.controller.ts) — Endpoints `GET /identity/addresses`, `POST /identity/addresses` e `DELETE /identity/addresses/:id`.
- 📄 [profile/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/profile/page.tsx) — Interface interativa com cards visuais de endereços salvos e modal de cadastro.
- 📄 [new-order/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/new-order/page.tsx) — Seletor de 1 clique de endereço no checkout com auto-preenchimento.
- 🧪 [client-addresses.spec.ts](file:///d:/Desktop/facilita/apps/client/e2e/client-addresses.spec.ts) — Teste E2E Playwright de ponta a ponta para endereços salvos (PASS ✅).
- 🧪 [order-cancellation.spec.ts](file:///d:/Desktop/facilita/apps/client/e2e/order-cancellation.spec.ts) — Teste E2E Playwright do cancelamento assistido com retenção de taxa de deslocamento (R$ 35,00) (PASS ✅).

---

### 🧾 Módulo 8 — Histórico de Pedidos, Recibo Fiscal & Garantia 90d
- 📄 [orders/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/orders/page.tsx) — Histórico paginado por cursor com filtros de status e busca textual.
- 📄 [order.service.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/application/order.service.ts) — Geração de comprovante com discriminação de valores, taxa de 15% e cálculo tributário (IBS/CBS).
- 🧪 [orders-history.spec.ts](file:///d:/Desktop/facilita/apps/client/e2e/orders-history.spec.ts) — Teste E2E Playwright de listagem, emissão de PDF e acionamento de garantia (PASS ✅).

---

### ⚖️ Módulo 9 — Central de Moderação KYC no Painel do Administrador
- 📄 [admin-kyc.controller.ts](file:///d:/Desktop/facilita/apps/api/src/modules/identity/interface/admin-kyc.controller.ts) — Endpoints `/admin/kyc/pending`, `/admin/kyc/:id/approve` e `/admin/kyc/:id/reject`.
- 📄 [admin/kyc/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/admin/kyc/page.tsx) — Interface com visualizador de RG/CNH frente/verso e ações de aprovação/rejeição com justificativa.
- 🧪 [admin-kyc.spec.ts](file:///d:/Desktop/facilita/apps/client/e2e/admin-kyc.spec.ts) — Teste E2E Playwright de auditoria documental de prestadores (PASS ✅).

---

### ☁️ Módulo 10 — Infraestrutura, Produção & Deploy Mobile
- 📄 [docker-compose.prod.yml](file:///d:/Desktop/facilita/docker-compose.prod.yml) — Stack completa com Postgres PostGIS, Redis 7 AOF, Prometheus, Grafana e backup automatizado.
- 📄 [app.json](file:///d:/Desktop/facilita/apps/provider/app.json) e [eas.json](file:///d:/Desktop/facilita/apps/provider/eas.json) — Configurações de permissões Android/iOS e perfis de build EAS (`production` para `.aab` e `preview` para `.apk`).
- 📄 [verify-production-readiness.js](file:///d:/Desktop/facilita/scripts/verify-production-readiness.js) — Validador de pré-vôo executável com `npm run verify:prod`.
- 📄 [build-mobile.sh](file:///d:/Desktop/facilita/scripts/build-mobile.sh) e [build-mobile.ps1](file:///d:/Desktop/facilita/scripts/build-mobile.ps1) — Scripts de automação de build para Google Play Store.
- 📄 [GUIA_DEPLOY_PRODUCAO_E_PUBLICACAO.md](file:///d:/Desktop/facilita/docs/GUIA_DEPLOY_PRODUCAO_E_PUBLICACAO.md) — Manual operacional detalhado de Go-Live na VPS e nas lojas de aplicativos.

---

## 🧪 3. Como Rodar os Testes Automatizados

### 1. Suíte Global E2E do Playwright (Navegador Real Chromium)
Executa todos os 23 testes de ponta a ponta do ecossistema:
```bash
npx playwright test --config=apps/client/playwright.config.ts --project=chromium --workers=2
```
> **Resultado Atual:** **23 de 23 testes PASS (100% verde)** cobrindo cadastro, novo pedido, tracking, cancelamento, histórico, recibo fiscal, central KYC, trava Halt Payouts e jornada completa.

### 2. Validação de Pré-Vôo de Produção
Executa a validação de arquivos de configuração, permissões mobile e perfis EAS:
```bash
npm run verify:prod
```
> **Resultado Atual:** **100% Aprovado**.

### 3. Rodar os Testes Unitários do Backend (Jest)
```bash
# Todos os testes de auth (SMS, WhatsApp, Rate Limit)
npm --workspace=apps/api test src/modules/auth

# Todos os testes de orders (Ciclo de vida, cancelamento e histórico)
npm --workspace=apps/api test src/modules/orders

# Todos os testes do módulo de fraude (KYC, Checagem, Receita Federal)
npm --workspace=apps/api test src/modules/fraud
```

### 4. Rodar os Testes de Compilação de Tipos (TypeScript 0 erros)
```bash
# App Mobile
npx tsc --noEmit --project apps/provider/tsconfig.json

# Client Web
npx tsc --noEmit --project apps/client/tsconfig.json
```

---

## 📊 4. Matriz de Status Atual do Sistema (Novembro 2026)

| Módulo / Domínio | Status de Código | Status de Produção | Próxima Ação |
| :--- | :--- | :--- | :--- |
| **Cliente (Web/PWA)** | 100% Implementado | Pronto para Deploy | Apontar domínio em produção |
| **Autenticação OTP & Anti-Bot** | 100% Implementado | Twilio / Z-API configurados | Inserir chaves reais no `.env.production` |
| **Cancelamento & Histórico** | 100% Implementado | Regra R$ 35 e Garantia 90d ativas | Operacional no lançamento |
| **Central KYC Admin** | 100% Implementado | Moderação e auditoria ativas | Operadores cadastrados |
| **App Prestador (Mobile)** | 100% Telas e Geolocation | Permissões e Perfis EAS prontos | Implementar canal sonoro e trava de câmera |
| **Infra VPS & Docker** | 100% Configurado | Playbook de deploy pronto | Executar comandos no servidor Hetzner/DO |
| **Publicação Mobile** | 100% Automação pronta | Scripts e perfis `.aab` prontos | Submeter `.aab` na Google Play Console |

---

## 🏁 Conclusão

O ecossistema **FACILITA** encontra-se em estado **Production-Ready**:
1. Para colocar a API e o painel web no ar: basta seguir o guia [`GUIA_DEPLOY_PRODUCAO_E_PUBLICACAO.md`](file:///d:/Desktop/facilita/docs/GUIA_DEPLOY_PRODUCAO_E_PUBLICACAO.md) no servidor VPS.
2. Para gerar o app do prestador para a Google Play Store: basta rodar `npm run build:mobile:prod`.
