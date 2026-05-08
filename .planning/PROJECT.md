# Project FACILITA — Transactional Marketplace

## Context
FACILITA is a "closed-loop" transactional marketplace focused on urgent domestic services (Electrical, Plumbing, Repairs). Unlike "listing" platforms (GetNinjas), FACILITA controls the payment, evidence, and warranty, ensuring a premium "everything in the app" experience.

## Vision
To be the most reliable platform for domestic emergencies in Brazil, where quality is guaranteed by mandatory evidence and a rigorous matching engine.

## Current State
- **Current Version**: v8.0 (Operational Excellence) - **Planning**
- **Last Shipped**: 2026-05-08 (v7.0)

<details>
<summary><b>Historical Milestones</b></summary>

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

## Current Milestone: v8.0 Operational Excellence

**Goal**: Enhance administrative productivity and refine service quality loops to support platform scale.

**Target features**:
- **Bulk Payouts**: Automated and manual batch processing for provider payments.
- **Granular Feedback Loops**: Evidence-based quality tracking and detailed customer/provider reviews.
- **Operational Dashboard**: Enhanced administrative tools for financial and quality monitoring.

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
*Last updated: 2026-05-08 after v7.0 milestone*
