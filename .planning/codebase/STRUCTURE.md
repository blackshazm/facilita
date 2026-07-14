# Structure

**Date:** 2026-07-13

## Root Layout
- `apps/`: Contains runnable applications.
  - `apps/api/`: NestJS backend.
  - `apps/client/`: Next.js web application.
  - `apps/provider/`: React Native Expo mobile application.
- `packages/`: Shared libraries.
  - `packages/database/`: Prisma schema and client.
  - `packages/event-bus/`: Shared event definitions.
  - `packages/ui/`: Shared UI components.

## API Structure (`apps/api/src/`)
- `modules/`: Contains all the bounded contexts (hexagons).
- `shared/` & `shared-kernel/`: Cross-cutting concerns and shared abstractions.
- `app.module.ts`, `main.ts`: Application entry points.
