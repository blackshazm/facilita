# Roadmap — FACILITA

## Phase 0: Foundation & Infrastructure (Completed)
- [x] Monorepo setup (Turborepo) with Bounded Context scaffolding (Identity, Catalog, Matching, Orders, Payments, Evidence, Fraud)
- [x] Database Schema (Prisma/PostgreSQL + PostGIS + GIST Indices) mapped to isolated schemas per module
- [x] Redis Geo & BullMQ infrastructure setup (Event Bus)
- [x] Support Tier definition & SLA Bot setup
- [x] Design System "Emerald 2.0" definition
- [x] CI/CD Pipelines (GitHub Actions)

## Phase 1: Authentication & Onboarding (Completed)
- [x] SMS OTP Service integration
- [x] KYC Flow for Providers
- [x] User/Provider profile management

## Phase 2: Catalog & Core Matching (In Progress)
- [x] 13-Category Service Catalog
- [ ] **Standardized Material Catalog** (Top 50 items)
- [x] Geo-Matching Engine V2 (PostGIS + Cascading logic)
- [ ] Order Creation/Tracking flow with "En-route" status

## Phase 3: Execution & Trust
- [ ] Evidence Upload (Photo) + Google Vision integration
- [ ] Real-time Chat (Stream.io)
- [ ] Order Timeline V1

## Phase 4: Financials & Tiers
- [ ] Pagar.me Split Integration
- [ ] Escrow logic
- [ ] Provider Tier Engine (Bronze/Prata/Ouro)
- [ ] Payout Scheduler

## Phase 5: Hardening & Launch
- [ ] Anti-fraud system
- [ ] Backoffice Dashboard
- [ ] PWA Optimization
- [ ] Final Beta Testing

## Phase 6: Strangler Fig Evolution (Post-Launch Scale)
- [ ] Extract Matching service (Mês 12-15) via Anti-Corruption Layers
- [ ] Extract Fraud analysis (Python/ML) (Mês 15-20)
- [ ] Extract Payments service (PCI DSS readiness) (Mês 20-30)
