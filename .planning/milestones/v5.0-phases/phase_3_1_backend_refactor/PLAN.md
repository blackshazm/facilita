# PLAN: Backend Hexagonal Refactoring (Phase 3.1)

Refactor existing backend modules to the "Modular Hexagonal Evolutive" architecture as specified in the PRD v3.0 and PROJECT.md governance.

## User Review Required
> [!IMPORTANT]
> This phase will change the directory structure of `apps/api/src/modules`. Ensure that no other developers are working on these modules during the refactor to avoid merge conflicts.

## Proposed Changes

### Infrastructure & Shared
#### [MODIFY] [schema.prisma](file:///d:/Desktop/facilita/packages/database/prisma/schema.prisma)
- Add missing models for `payments`, `disputes`, and `evidence`.
- Ensure all models use the `@schema` attribute correctly.

### Identity Module (Refactor)
#### [NEW] [user.entity.ts](file:///d:/Desktop/facilita/apps/api/src/modules/identity/core/user.entity.ts)
#### [NEW] [user-repository.port.ts](file:///d:/Desktop/facilita/apps/api/src/modules/identity/ports/user-repository.port.ts)
#### [NEW] [prisma-user-repository.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/identity/adapters/prisma-user-repository.adapter.ts)
#### [NEW] [get-user.usecase.ts](file:///d:/Desktop/facilita/apps/api/src/modules/identity/application/get-user.usecase.ts)
#### [DELETE] [legacy-identity-files]

### Catalog Module (Refactor)
- Follow the same pattern: `core/`, `ports/`, `adapters/`, `application/`.

### Orders Module (Refactor)
- Follow the same pattern: `core/`, `ports/`, `adapters/`, `application/`.

## Verification Plan

### Automated Tests
- Run `npm run lint:boundary` in `apps/api`.
- Create contract tests for `user-repository.port.ts`.
- Run Prisma validation: `npx prisma validate`.

### Manual Verification
- Verify that the API still builds and starts correctly: `npm run dev`.
