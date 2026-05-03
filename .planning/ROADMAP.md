# Roadmap — FACILITA v3.0

## Milestone: Foundation & Architecture (Current)
*Goal: Implement the core Modular Hexagonal structure across all critical modules.*

### Phase 3.1: Backend Hexagonal Refactoring [ESTRUTURAL]
- [ ] Refactor `identity`, `catalog`, and `orders` to `core/ports/adapters` pattern.
- [ ] Implement `shared/events` for cross-module orchestration.
- [ ] Database hardening: Add `payments`, `disputes`, and `evidence` tables.

### Phase 3.2: Provider App (Expo) Baseline [FUNCIONAL]
- [ ] Initialize Expo project with Native Camera and Geolocation.
- [ ] Implement Provider Onboarding Flow (KYC + MEI Validation).

### Phase 3.3: Client App (PWA) Core [FUNCIONAL]
- [ ] Next.js 15 App Router migration & Service Catalog landing.
- [ ] Standardized Order Flow (Selection -> Photos -> Match).

## Milestone: Execution & Trust
### Phase 4.1: Evidence & Matching
- [ ] PostGIS Geo-Matching V2 (Cascading Logic).
- [ ] Photo Evidence system with Metadata validation (Google Vision).

### Phase 4.2: Financials & Disputes
- [ ] Pagar.me Split & Escrow integration.
- [ ] Dispute Management & Refund logic.

## Milestone: Scale & Hardening
### Phase 5.1: Payment Escrow & Wallet Module
- [ ] Ledger-based Wallet system for provider balances.
- [ ] Pagar.me Escrow API integration for order payments.
- [ ] Tier-based payout automation (D+15, D+7, D+2).
- [ ] Automated Refund and Cancellation logic.

### Phase 5.2: Anti-fraud & Tiering Engine
- [ ] Anti-fraud Engine (Rules & Thresholds).
- [ ] Provider Tiering Engine (Bronze/Prata/Ouro).
- [ ] Backoffice Ops Dashboard.

