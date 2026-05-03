# PLAN: Evidence & AI Validation (Phase 4.2)

Implement the Trust & Safety module responsible for validating service execution through photo evidence and metadata analysis.

## User Review Required
> [!IMPORTANT]
> Metadata extraction relies on the photo file containing EXIF data. If the provider's device strips this data, the system will flag the evidence for manual review.

## Proposed Changes

### Evidence Module (Hexagonal)
#### [NEW] [evidence.entity.ts](file:///d:/Desktop/facilita/apps/api/src/modules/evidence/core/evidence.entity.ts)
- Domain entity with state (`PENDING`, `VALIDATED`, `REJECTED`) and metadata fields.
#### [NEW] [metadata-extractor.port.ts](file:///d:/Desktop/facilita/apps/api/src/modules/evidence/ports/metadata-extractor.port.ts)
- Port for extracting EXIF/GPS data from buffers.

### Trust Logic
#### [NEW] [validate-evidence.usecase.ts](file:///d:/Desktop/facilita/apps/api/src/modules/evidence/application/validate-evidence.usecase.ts)
- Business logic:
  1. Extract metadata.
  2. Cross-reference GPS with Order location (max 500m deviation).
  3. Verify timestamp is within order window.
  4. Flag for AI analysis.

### Integration
#### [NEW] [evidence.module.ts](file:///d:/Desktop/facilita/apps/api/src/modules/evidence/evidence.module.ts)
- Register evidence services and hooks into the Orders lifecycle.

## Verification Plan

### Automated Tests
- Unit tests for metadata extractor with mock EXIF data.
- Validation logic tests: Confirm rejection if GPS is > 500m from target.

### Manual Verification
- Upload a photo with manual GPS spoofing to verify system rejection.
