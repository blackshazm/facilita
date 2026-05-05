# Phase 2: Catalog & Matching - Plan

## Phase Goal
Implement the service catalog and the geospatial matching engine using PostGIS to find the closest providers for a given service category.

## Technical Strategy
- Enable `postgis` in the database.
- Use Prisma `previewFeatures = ["multiSchema"]` to manage `catalog` and `matching` schemas.
- Implement `CatalogModule` for category management and service discovery.
- Implement `MatchingModule` using raw SQL for ST_DWithin and ST_Distance (since Prisma has limited native PostGIS support for queries).
- Use `EventEmitter2` for decoupled communication between `Identity` and `Matching`.

## Threat Model (STRIDE)

| ID | Threat | Component | Severity | Mitigation |
|----|--------|-----------|----------|------------|
| T2-LOC-SPOOF | Provider falsifies GPS data via API to appear closer to demand hotspots. | MatchingModule | Medium | Cross-reference with ISP/IP data; implement velocity checks (impossible jumps). |
| T2-LOC-PRIVACY | Information disclosure of provider's exact location before a match is made. | MatchingModule | High | Return randomized "neighborhood-level" coordinates (fuzzing) in search results until match. |
| T2-CAT-DOS | Large number of service categories/filters requested to crash query. | CatalogModule | Low | Pagination and mandatory category filtering in search. |

---

## Tasks

### Wave 1: Database & Core Infrastructure

#### Task 1: Enable PostGIS and Schema Update
- **ID**: P2-W1-T1
- **Type**: execute
- **Priority**: High
- **Autonomous**: true
- **<read_first>**
  - `packages/database/prisma/schema.prisma`
- **<action>**
  - Update `schema.prisma` to include `catalog` and `matching` schemas in `schemas = ["public", "identity", "catalog", "matching"]`.
  - Add `Category` and `Service` models to the `catalog` schema.
  - Add `ProviderLocation` model to the `matching` schema with a `Unsupported("geometry(Point, 4326)")` field.
  - Create a migration to enable PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis;`.
- **<acceptance_criteria>**
  - `npx prisma migrate dev` completes successfully.
  - `SELECT postgis_full_version();` returns version info in DB.
  - Tables `catalog.Category`, `catalog.Service`, and `matching.ProviderLocation` exist.

### Wave 2: Catalog Implementation

#### Task 2: Implement Catalog Module
- **ID**: P2-W2-T1
- **Type**: execute
- **Priority**: High
- **Autonomous**: true
- **<read_first>**
  - `apps/api/src/app.module.ts`
- **<action>**
  - Create `apps/api/src/modules/catalog/catalog.module.ts`.
  - Implement `CategoryService` to list/get categories.
  - Implement `ServiceDiscoveryService` to find services within categories.
  - Add `CatalogController` with `GET /catalog/categories` and `GET /catalog/services`.
- **<acceptance_criteria>**
  - Endpoints return JSON list of categories.
  - Services are filtered by `categoryId`.

#### Task 3: Seed Catalog Data
- **ID**: P2-W2-T2
- **Type**: execute
- **Priority**: Medium
- **Autonomous**: true
- **<action>**
  - Create a seed script (or update existing) with the 13 mandatory categories (Eletricista, Encanador, Pintor, etc.).
- **<acceptance_criteria>**
  - `npx prisma db seed` populates the `catalog.Category` table.

### Wave 3: Matching & Presence

#### Task 4: Provider Presence Sync (Event Bus)
- **ID**: P2-W3-T1
- **Type**: execute
- **Priority**: High
- **Autonomous**: true
- **<read_first>**
  - `apps/api/src/modules/identity/application/auth.service.ts`
- **<action>**
  - Configure `EventEmitterModule.forRoot()` in `AppModule`.
  - Emit `provider.online` and `provider.offline` events from `Identity` module (e.g., in a new `ProviderStatusService`).
  - Create `MatchingModule` and a listener `ProviderStatusListener` that maintains an active providers list in the `matching` schema.
- **<acceptance_criteria>**
  - Toggling online status in Identity triggers a row creation/update in `matching.ActiveProvider`.

#### Task 5: Geospatial Search Engine
- **ID**: P2-W3-T2
- **Type**: execute
- **Priority**: Critical
- **Autonomous**: true
- **<action>**
  - Implement `MatchingService.findNearbyProviders(coords, categoryId, radiusKm)`.
  - Use `this.prisma.$queryRaw` for `ST_DWithin` and `ST_Distance`.
  - Add `POST /matching/location` for providers to update coordinates.
  - Add `GET /matching/search` for users.
- **<acceptance_criteria>**
  - Search returns providers sorted by distance.
  - Providers > radius are excluded.
  - Search respects the 5-minute location freshness threshold.

---

## Verification Plan

### Automated Verification
- `npm run test:matching`: Unit tests for distance calculation.
- `npx prisma validate`: Ensure schema integrity.

### Manual UAT (User Acceptance Testing)
1. **Catalog Check**: `GET /catalog/categories` returns the 13 categories.
2. **Presence Flow**: 
   - Set Provider A to "Online".
   - `POST /matching/location` for Provider A.
   - `GET /matching/search` as User should find Provider A.
3. **Radius Limit**: 
   - Move Provider A to 20km away.
   - `GET /matching/search` with 10km radius should NOT find Provider A.
