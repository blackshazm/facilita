# Cross-AI Plan Review Request

You are reviewing implementation plans for a software project phase.
Provide structured feedback on plan quality, completeness, and risks.

## Project Context
FACILITA is a "closed-loop" transactional marketplace focused on urgent domestic services (Electrical, Plumbing, Repairs). Unlike "listing" platforms (GetNinjas), FACILITA controls the payment, evidence, and warranty, ensuring a premium "everything in the app" experience.
Goal of current milestone v8.0 (Operational Excellence): Enhance administrative productivity and refine service quality loops to support platform scale.
- Bulk Payouts: Automated and manual batch processing for provider payments.
- Granular Feedback Loops: Evidence-based quality tracking and detailed customer/provider reviews.
- Operational Dashboard: Enhanced administrative tools for financial and quality monitoring.

High-Level Stack:
- Next.js 15 PWA (Client)
- Expo / React Native (Provider)
- NestJS + Prisma + PostgreSQL (PostGIS) (Backend)
- BullMQ + Redis (Event-Driven Background Processing)
- Pagar.me (Payments)
- Stream.io (Chat)

Core Principles:
- Evidence-First: No order is closed without photo evidence.
- Trust-by-Doing: Providers earn tiers through performance, not just sign-up.
- Zero-Downtime Service: High availability for urgent needs.
- Modular Hexagonal Evolutivo: Monolito de deploy único dividido em Bounded Contexts autônomos (Hexágonos), isolados com Anti-Corruption Layers.
- Isolamento de Domínio: Cada módulo mantém suas regras de negócio agnósticas (TypeScript puro) e schemas de banco separados.
- Comunicação por Event-Bus: Fluxos síncronos apenas para consistência financeira; o resto opera via eventos de domínio assíncronos.

## Phase 08.2: Payout Resilience & Automation
### Roadmap Section
Goal: Automate the reconciliation of payout statuses via gateway webhooks.
- Requirements: PAY-05.
- Success Criteria:
    - Internal ledger status updates from `Pending` to `Paid` automatically on Pagar.me confirmation.
    - Failed transfers trigger an internal alert/log for admin review.

### Requirements Addressed
- **PAY-05**: **Payout Conciliation Webhooks**. System must automatically reconcile internal ledger statuses based on Pagar.me transfer events.

### User Decisions (CONTEXT.md)
#### Ciclo de Vida & Resolução do Lote
- **D-01 (Resolução do Lote):** O lote (`PayoutBatch`) rastreia apenas o disparo inicial bem-sucedido para o gateway, sendo marcado como `COMPLETED` após o processador terminar de enfileirar todos os itens. Falhas assíncronas posteriores de repasses individuais notificadas via webhook são tratadas estritamente de forma individual no nível de `Payout` (mudança de status para `FAILED` e execução de estorno via `ReverseFailedPayoutUseCase`), sem alterar o status geral do lote.

#### Segurança do Webhook
- **D-02 (Segurança de Assinatura):** Validação híbrida da assinatura do cabeçalho `x-pagarme-signature`. Em ambiente de Produção, a verificação criptográfica estrita via HMAC-SHA256 usando o `PAGARME_WEBHOOK_SECRET` é obrigatória, rejeitando requisições sem assinatura válida com `401 Unauthorized`. Para testes locais e automação de UAT, a validação da assinatura é contornada de forma segura caso a chave de testes do Pagar.me (`PAGARME_SECRET_KEY`) esteja configurada como `sk_test_mock`.

#### Resiliência & Tratamento de Erros
- **D-03 (Tratamento de Falhas Bancárias):** Abordagem orientada a eventos desacoplados. Quando o webhook do Pagar.me sinalizar que uma transferência falhou (`transfer.failed`), o endpoint de webhook realiza o estorno do saldo via `ReverseFailedPayoutUseCase`, registra formalmente o incidente no `FinancialAuditLog`, e dispara o evento de domínio NestJS `payout.failed`. Alertas operacionais adicionais são consumidos de forma assíncrona por listeners deste evento.
- **D-04 (Garantias de Idempotência):** O endpoint de processamento do webhook deve ser estritamente idempotente. Antes de aplicar transições de status no banco ou disparar estornos de saldo, o sistema deve verificar se o `Payout` já está em um estado terminal (`PAID` ou `FAILED`). Se estiver, o webhook deve retornar sucesso `200 OK` imediatamente, evitando execuções repetidas.

### Research Findings
#### 1. Pagar.me Webhook Integration & Signature Verification
Events handled:
- `transfer.processing`: Map to `PROCESSING` status.
- `transfer.transferred` (or `transfer.success`): Map to `PAID` status.
- `transfer.failed`: Map to `FAILED` status.
- `transfer.canceled`: Map to `FAILED` status.

#### 2. NestJS Raw Body Capture & Verification
- NestJS 9+ native support: `NestFactory.create(AppModule, { rawBody: true })`. Stores raw buffer as `request.rawBody`.
- HMAC-SHA256 validation via `crypto.timingSafeEqual`.
- Bypass for UAT when `PAGARME_SECRET_KEY` === `sk_test_mock`.

#### 3. Idempotency & Database Integration
- Extension to PayoutRepositoryPort: `findByExternalId(externalId: string): Promise<PayoutProps | null>`.
- Double processing/race protection by checking terminality first.

### Plans to Review

#### PLAN 01: Setup rawBody and Extend Repository
- Wave 1, autonomous, requirements: PAY-05.
- Tasks:
  1. **Enable rawBody in NestJS bootstrap**: In `apps/api/src/main.ts`, add `{ rawBody: true }` in `NestFactory.create(AppModule)`.
  2. **Extend Payout repository port and adapter**:
     - `PayoutRepositoryPort` interface: `findByExternalId(externalId: string): Promise<PayoutProps | null>`.
     - `PrismaPayoutRepository` implementation: query by `externalId` using `prisma.payout.findUnique({ where: { externalId } })` and map back.

#### PLAN 02: Implement Webhook Logic and Tests
- Wave 2, autonomous, depends on Plan 01, requirements: PAY-05.
- Tasks:
  1. **Create ProcessPayoutWebhookUseCase**:
     - Handle signature verification using HMAC-SHA256 and `crypto.timingSafeEqual`.
     - Support mock bypass if `process.env.PAGARME_SECRET_KEY === 'sk_test_mock'`.
     - Early return `200 OK` `{ received: true }` if Payout is already terminal (`PAID` or `FAILED`).
     - Map events: `transfer.processing` -> `PROCESSING`, `transfer.transferred` -> `PAID`, `transfer.failed` -> `FAILED`, `transfer.canceled` -> `FAILED`.
     - Update status in DB via `payoutRepository.save(payout)`.
     - Dispatch event `payout.failed` with payload `{ payoutId, providerId, amount }` if status transitions to `FAILED`.
  2. **Update Webhook Controller and Payments Module**:
     - Register `ProcessPayoutWebhookUseCase` as provider in `payments.module.ts`.
     - In `payment.webhook.controller.ts`, inject the usecase and route `transfer.*` events to it, passing `req.rawBody`, signature, and body.
  3. **Write Automated Webhook Jest Tests**:
     - In `apps/api/src/modules/payments/__tests__/payout-webhook.spec.ts`: test signature verification, mock bypass, idempotency (terminal states), event mapping, status transition to `PAID`, status transition to `FAILED` with `payout.failed` dispatch.

---

## Review Instructions

Analyze each plan and provide:

1. **Summary** — One-paragraph assessment
2. **Strengths** — What's well-designed (bullet points)
3. **Concerns** — Potential issues, gaps, risks (bullet points with severity: HIGH/MEDIUM/LOW)
4. **Suggestions** — Specific improvements (bullet points)
5. **Risk Assessment** — Overall risk level (LOW/MEDIUM/HIGH) with justification

Focus on:
- Missing edge cases or error handling
- Dependency ordering issues
- Scope creep or over-engineering
- Security considerations
- Performance implications
- Whether the plans actually achieve the phase goals

Output your review in markdown format.
