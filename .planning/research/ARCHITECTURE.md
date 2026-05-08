# Research Dimension: Architecture (v8.0)

## Current Context
- **Architecture**: Modular Hexagonal Evolutivo.
- **Key Modules**: `Payments`, `Orders`, `Providers`, `Admin`.

## Integration Points

### 1. Payments Module (Payout Service)
- **New Component**: `BatchPayoutService`.
- **Integration**: Must listen to `PayoutRequested` events and aggregate them or provide an API for the Admin module to trigger batches.
- **Anti-Corruption Layer (ACL)**: Map Pagar.me's Transfer response objects to internal Ledger entities.

### 2. Quality/Reviews Module
- **New Bounded Context**: `Reviews`.
- **Relationship**: 1:1 with `Order`.
- **Dependencies**: Depends on `Order` (to verify completion) and `Media` (for evidence photos).

### 3. Data Flow
1. **Admin** triggers `CreateBatch` -> `BatchPayoutService`.
2. `BatchPayoutService` fetches `PendingPayouts` from `Ledger`.
3. `BatchPayoutService` spawns `BullMQ` jobs for each transfer.
4. `BullMQ` worker calls `PagarmeAdapter` -> Pagar.me API.
5. `PagarmeAdapter` receives webhook -> `PaymentsService` updates `Ledger`.

## Architecture Decisions (Draft)
- **Soft Delete for Reviews**: Never hard delete feedback for audit purposes.
- **Async Review Processing**: Use BullMQ for sentiment analysis and ranking updates to keep the "Submit Review" UI fast.
