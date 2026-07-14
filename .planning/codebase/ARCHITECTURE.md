# Architecture

**Date:** 2026-07-13

## Pattern
**Modular Hexagonal Evolutivo**
The backend is a single deployable monolith divided into autonomous Bounded Contexts (Hexagons), isolated via Anti-Corruption Layers.

## Data Flow
- **Event-Driven:** Synchronous flows are strictly used for financial consistency. All other domain operations operate via asynchronous domain events using BullMQ and Redis.
- **Strangler Fig Pattern:** Evolution to microservices is based on real operational bottlenecks.

## Modules (Bounded Contexts)
Found in `apps/api/src/modules/`:
- `analytics`, `auth`, `catalog`, `disputes`, `evidence`, `fiscal`, `fraud`, `identity`, `jobs`, `matching`, `notifications`, `orders`, `payments`, `reviews`, `users`.

## Boundaries
Strict enforcement of module boundaries is maintained via `eslint-plugin-boundaries` and contract testing. Each module maintains agnostic business rules in pure TypeScript with separate database schemas.
