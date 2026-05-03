# Tasks: Phase 4.1 Matching V2

- [x] **Matching Core & Ports**
    - [x] Create `core/provider-status.entity.ts`
    - [x] Create `ports/matching-engine.port.ts`
- [x] **PostGIS Adapter Implementation**
    - [x] Create `adapters/postgis-matching.adapter.ts` with Raw SQL (ST_DWithin)
    - [x] Implement `findNearbyProviders` with radius parameter
- [x] **Cascading Use Case**
    - [x] Create `application/match-provider.usecase.ts`
    - [x] Implement retry/expansion logic (1km, 5km, 10km)
- [x] **Integration & Cleanup**
    - [x] Refactor `matching.module.ts`
- [x] **Verification**
    - [x] Run spatial query smoke test
