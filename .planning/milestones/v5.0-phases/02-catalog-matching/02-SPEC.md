# Phase 2: Catalog & Matching (SPEC)

## 1. What Are We Building?
This phase implements the core marketplace matching logic. We are defining the service catalog (what can be ordered) and the engine that finds the best provider for a given request using geospatial data.

## 2. Technical Specifications

### 2.1 Service Catalog (Module: `Catalog`)
- **Hierarchy**: `Category` -> `Service`.
- **Predefined Categories**: 13 standard categories (Electrician, Plumber, AC Technician, etc.).
- **Price Engine**: 
  - Each service has a `basePrice`.
  - Support for `materialPrice` (Standardized parts catalog).
- **Schema Isolation**: Managed in the `catalog` PostgreSQL schema.

### 2.2 Geospatial Matching Engine (Module: `Matching`)
- **Technology**: PostGIS for coordinate storage and spatial queries.
- **Index**: GIST index on `ProviderLocation.coords`.
- **Search Logic**:
  - `ST_DWithin`: Find providers within X km radius.
  - `ST_Distance`: Sort by proximity.
- **Cascading Strategy (Implementation Plan)**:
  - Phase 2 focuses on the **Single Point Match** (finding candidates).
  - The "5 min timeout / expansion" logic belongs to the `Orders` module (Phase 3).

### 2.3 Real-Time Presence
- Providers will send periodic location updates via a protected endpoint.
- Presence status is a combination of:
  - `Identity.isOnline` (Toggle).
  - `Identity.availabilitySlots` (Schedule).
  - `Matching.lastKnownLocation` (Freshness threshold < 5 min).

### 2.4 Cross-Context Sync (Event-Driven)
- When a Provider toggles "Online" in `IdentityModule`, an event `ProviderStatusChanged` is published.
- `MatchingModule` consumes this to update its internal `ActiveProvider` cache/table.
- This ensures schema isolation (Matching doesn't query Identity directly).

## 3. Database Schema Updates

### `catalog` schema
- `Category`: `id, name, slug, description, iconUrl`.
- `Service`: `id, categoryId, name, description, basePrice, unitType (HOUR/FIXED)`.

### `matching` schema
- `ProviderLocation`: `id, providerId, coords (Geography), updatedAt`.
- `MatchingCache`: A table/view containing providerId, categoryIds, and current status for fast filtering.

## 4. Deliverables
1. NestJS `CatalogModule` with Categories/Services CRUD.
2. NestJS `MatchingModule` with PostGIS integration.
3. Event Bus integration (Internal EventEmitter2 for monorepo dev).
4. `POST /matching/location` for providers to update their GPS.
5. `GET /matching/search` for users to see available providers/estimates.
