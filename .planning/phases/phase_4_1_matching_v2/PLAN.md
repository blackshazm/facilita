# PLAN: PostGIS Geo-Matching V2 (Phase 4.1)

Implement the high-performance cascading matching logic using PostGIS to connect customers with the best available providers.

## User Review Required
> [!IMPORTANT]
> The cascading logic (1km -> 5km -> 10km) increases database query complexity. I will use GIST spatial indices to ensure sub-100ms performance as required by PRD v3.0.

## Proposed Changes

### Matching Module (Hexagonal Refactor)
#### [NEW] [provider-status.entity.ts](file:///d:/Desktop/facilita/apps/api/src/modules/matching/core/provider-status.entity.ts)
- Domain entity managing provider availability and current location.
#### [NEW] [matching-engine.port.ts](file:///d:/Desktop/facilita/apps/api/src/modules/matching/ports/matching-engine.port.ts)
- Interface for the search and matching logic.
#### [NEW] [postgis-matching.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/matching/adapters/postgis-matching.adapter.ts)
- PostGIS implementation with raw SQL for optimal spatial search performance.

### Application Logic
#### [NEW] [match-provider.usecase.ts](file:///d:/Desktop/facilita/apps/api/src/modules/matching/application/match-provider.usecase.ts)
- Orchestrates the cascading search:
  1. Search within 1km.
  2. If zero results, search within 5km.
  3. Final attempt within 10km.

### Integration
#### [MODIFY] [matching.module.ts](file:///d:/Desktop/facilita/apps/api/src/modules/matching/matching.module.ts)
- Register new ports and adapters.

## Verification Plan

### Automated Tests
- Integration tests using a temporary branch to verify spatial queries.
- Benchmark: Matching execution time must be < 200ms.

### Manual Verification
- Manually trigger a search with a mock provider at different distances to verify cascading logic.
