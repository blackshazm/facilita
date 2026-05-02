# Project FACILITA — Transactional Marketplace

## Context
FACILITA is a "closed-loop" transactional marketplace focused on urgent domestic services (Electrical, Plumbing, Repairs). Unlike "listing" platforms (GetNinjas), FACILITA controls the payment, evidence, and warranty, ensuring a premium "everything in the app" experience.

## Vision
To be the most reliable platform for domestic emergencies in Brazil, where quality is guaranteed by mandatory evidence and a rigorous matching engine.

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
