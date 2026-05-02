# Roadmap — FACILITA

## Phase 0: Foundation & Infrastructure (Current)
- [ ] Monorepo setup (Turborepo) with Bounded Context scaffolding (Identity, Catalog, Matching, Orders, Payments, Evidence, Fraud)
- [ ] Database Schema (Prisma/PostgreSQL + PostGIS + GIST Indices) mapped to isolated schemas per module
- [ ] Redis Geo & BullMQ infrastructure setup (Event Bus)
- [ ] Support Tier definition & SLA Bot setup
- [ ] Design System "Emerald 2.0" definition
- [ ] CI/CD Pipelines (GitHub Actions)

## Phase 1: Authentication & Onboarding
- [ ] SMS OTP Service integration
- [ ] KYC Flow for Providers
- [ ] User/Provider profile management

## Phase 2: Catalog & Core Matching
- [ ] 13-Category Service Catalog
- [ ] **Standardized Material Catalog** (Top 50 items)
- [ ] Geo-Matching Engine V2 (PostGIS + Cascading logic)
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
