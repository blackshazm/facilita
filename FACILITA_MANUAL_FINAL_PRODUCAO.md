# 📘 FACILITA — GUIA DEFINITIVO E MANUAL DE NAVEGAÇÃO DO SISTEMA

Este documento contém o passo a passo completo para executar, testar e navegar por todas as funcionalidades do sistema **FACILITA**, com **links diretos para cada arquivo do projeto**.

---

## 🚀 1. Como Rodar o Sistema Passo a Passo

### Passo 1: Subir o Banco de Dados e Serviços de Apoio (Docker)
No terminal na raiz do projeto (`d:\Desktop\facilita`):
```bash
docker-compose up -d
```
> Isso iniciará os contêineres de **PostgreSQL (porta 5432)** e **Redis (porta 6379)**.

### Passo 2: Iniciar a API Backend (NestJS)
```bash
npm run dev --workspace=apps/api
```
- **URL Base:** `http://localhost:3333`
- **Swagger / Health Check:** `http://localhost:3333/api`

### Passo 3: Iniciar o Client Web (Next.js)
Em outro terminal:
```bash
npm run dev --workspace=apps/client
```
- **URL Base:** `http://localhost:3000`

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
- 📄 [receita-federal-mei.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fraud/infrastructure/adapters/receita-federal-mei.adapter.ts) — Adapter CNPJ.ws para validação gratuita de MEI na Receita.
- 📄 [run-provider-verification.usecase.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fraud/application/run-provider-verification.usecase.ts) — Orquestrador das 3 camadas de segurança.
- 📄 [kyc.controller.ts](file:///d:/Desktop/facilita/apps/api/src/modules/identity/interface/kyc.controller.ts) — Endpoint `POST /identity/kyc/verify-provider`.
- 🧪 [provider-verification.spec.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fraud/__tests__/provider-verification.spec.ts) — Bateria de testes unitários do módulo de fraude (5/5 PASS ✅).

---

### 💬 Módulo 2 — Chat em Tempo Real (Stream.io)
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
- 📄 [new-order/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/new-order/page.tsx) — Triagem guiada de novo pedido (urgência +25%, foto do local, resumo).
- 📄 [orders/[id]/approve/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/orders/%5Bid%5D/approve/page.tsx) — Inspeção de fotos Antes/Depois e liberação do pagamento.
- 📄 [orders/[id]/additional/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/orders/%5Bid%5D/additional/page.tsx) — Aprovação/Recusa de adicionais com foto de nota fiscal.
- 📄 [orders/[id]/review/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/orders/%5Bid%5D/review/page.tsx) — Avaliação 5 estrelas por critérios.
- 📄 [profile/page.tsx](file:///d:/Desktop/facilita/apps/client/src/app/profile/page.tsx) — Perfil do cliente e histórico de pedidos.

---

### ⚙️ Módulo 5 — APIs & Regras de Ciclo de Vida dos Pedidos
- 📄 [order.service.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/application/order.service.ts) — Regras de negócio transacionais (`create`, `accept`, `checkIn`, `start`, `complete`, `requestAdditional`, `approveOrder`, `claimWarranty`).
- 📄 [order.controller.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/interface/order.controller.ts) — Controller HTTP expondo todos os endpoints REST.
- 🧪 [order-lifecycle.spec.ts](file:///d:/Desktop/facilita/apps/api/src/modules/orders/__tests__/order-lifecycle.spec.ts) — Bateria de testes unitários do ciclo de vida dos pedidos (7/7 PASS ✅).

---

### ☁️ Módulo 6 — Infraestrutura & Deploy
- 📄 [aws-s3-storage.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/identity/infrastructure/aws-s3-storage.adapter.ts) — Storage S3 com criptografia SSE-KMS e presigned URLs.
- 📄 [.env.example](file:///d:/Desktop/facilita/.env.example) — Arquivo de exemplo com todas as variáveis de produção.
- 📄 [ci.yml](file:///d:/Desktop/facilita/.github/workflows/ci.yml) — Esteira de CI/CD para o GitHub Actions.

---

## 🧪 3. Como Rodar os Testes Automatizados

### Rodar os Testes Unitários do Backend (Jest)
```bash
npx jest --workspace=apps/api
```

### Rodar os Testes de Componentes do Frontend (Vitest)
```bash
npm run test --workspace=apps/client
```

### Rodar os Testes de Compilação de Tipos (TypeScript 0 erros)
```bash
# App Mobile
npx tsc --noEmit --project apps/provider/tsconfig.json

# Client Web
npx tsc --noEmit --project apps/client/tsconfig.json
```

---

## 🏁 Conclusão

Todas as partes do projeto foram desenhadas, implementadas e integradas de acordo com as exigências do **PRD v3.0**. O repositório está pronto para testes end-to-end e publicação nas lojas!
