# Project FACILITA — Transactional Marketplace

## Context
FACILITA is a "closed-loop" transactional marketplace focused on urgent domestic services (Electrical, Plumbing, Repairs). Unlike "listing" platforms (GetNinjas), FACILITA controls the payment, evidence, and warranty, ensuring a premium "everything in the app" experience.

## Vision
To be the most reliable platform for domestic emergencies in Brazil, where quality is guaranteed by mandatory evidence and a rigorous matching engine.

## Current State
- **Current Version**: v11.0 (Em Planejamento)
- **Last Shipped**: 2026-07-16 (v10.0)

<details>
<summary><b>Historical Milestones</b></summary>

### v10.0 Robust Testing & QA (2026-07-16)
- **Goal**: Garantir a estabilidade da plataforma com cobertura de testes completa em todas as partes do sistema.
- **Achievements**:
    - [x] **Test Orchestration**: Setup global do TurboRepo para testes unitários e E2E.
    - [x] **Massive Test Generation**: 40+ arquivos de testes gerados cobrindo 100% dos módulos do backend.
    - [x] **Mega-Teste Cross-Platform**: Testes E2E (Playwright) interligando Cliente, Provedor e Admin num fluxo único de lifecycle.

### v9.0 Operational Dashboard (2026-07-15)
- **Goal**: Construir o painel administrativo aprimorado para monitoramento financeiro e de qualidade da plataforma.
- **Achievements**:
    - [x] **Granular Feedback Loops**: Módulo de avaliação com fotos obrigatórias, tags de justificativas e recálculo assíncrono via BullMQ.
    - [x] **Operational Dashboard**: Dashboard financeiro e de qualidade administrativa com controles de pagamentos em massa (pausar/retomar).

### v8.0 Operational Excellence (2026-07-13)
- **Goal**: Enhance administrative productivity and refine service quality loops to support platform scale.
- **Achievements**:
    - [x] **Bulk Payouts**: Automated and manual batch processing for provider payments.
    - [x] **Payout Resilience**: Webhook validation and automated reversals.
    - [x] **Advanced Feedback Loops**: Service quality evaluation structure.

### v7.0 Expansion & Payouts (2026-05-08)
- **Goal**: Automate the financial lifecycle, enable regional scale, and drive organic growth through referrals.
- **Achievements**:
    - [x] **Payout Automation**: Automated ledger-to-gateway transfers with audit logs.
    - [x] **Regional Scale**: Multi-city support and neighborhood geo-fencing.
    - [x] **Viral Growth**: Referral system with D+15 rewards via BullMQ.
    - [x] **Operational Control**: Admin dashboard for manual payout management.

### v6.0 Growth & Compliance (2026-05-06)
- **Goal**: Expand platform analytical capabilities, ensure fiscal compliance for 2026, and achieve full production readiness for the Provider app.

### v5.0: Scale & Hardening (2026-05-04)
- Focus on Escrow systems, Tiering engine and Fraud prevention.
</details>

## Next Milestone: v11.0 Live Tracking & Dispatch

**Goal:** Implementar o rastreamento em tempo real do provedor para serviços urgentes, reduzindo a ansiedade do cliente e reforçando o pilar "evidence-first".

**Target features:**
- Transmissão de localização em tempo real pelo app do Provedor (React Native/Expo).
- Visualização ao vivo no mapa pelo app do Cliente (Next.js PWA).
- Atualização do status de despacho e cálculo de ETA (Tempo Estimado de Chegada).

## Stakeholders
- **Users**: Customers needing urgent home repairs.
- **Providers**: MEI-registered professionals seeking qualified leads and automated management.
- **Backoffice**: Operational team monitoring fraud and quality.

## High-Level Stack
- **Next.js 15 PWA** (Client)
- **Expo / React Native** (Provider)
- **NestJS + Prisma + PostgreSQL (PostGIS)** (Backend)
- **BullMQ + Redis** (Event-Driven Background Processing)
- **Pagar.me** (Payments)
- **Stream.io** (Chat)

## Core Principals
- **Evidence-First**: No order is closed without photo evidence.
- **Trust-by-Doing**: Providers earn tiers through performance, not just sign-up.
- **Zero-Downtime Service**: High availability for urgent needs.
- **Modular Hexagonal Evolutivo**: Monolito de deploy único dividido em Bounded Contexts autônomos (Hexágonos), isolados com Anti-Corruption Layers.
- **Isolamento de Domínio**: Cada módulo mantém suas regras de negócio agnósticas (TypeScript puro) e schemas de banco separados.
- **Comunicação por Event-Bus**: Fluxos síncronos apenas para consistência financeira; o resto opera via eventos de domínio assíncronos.
- **Strangler Fig Pattern**: Evolução para microserviços baseada em gargalos operacionais reais, com extração cirúrgica sem reescrita de core domain.

## Governance
- **Workflow**: All changes follow the **GSD (Get Shit Done)** framework: `Spec -> Discuss -> Plan -> Secure -> Execute -> Verify`.
- **Architectural Guardrails**: Strict enforcement of module boundaries via `eslint-plugin-boundary` and contract testing.
- **Orchestration**: Managed by the `gsd-master-orchestrator` skill, ensuring every code change is backed by a validated plan and verification loop.

---
*Last updated: 2026-07-16 after v9.0 milestone*

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
