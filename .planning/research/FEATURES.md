# Research Dimension: Features (v8.0)

## Feature Categories

### 1. Bulk Payouts (Scalability)
- **Batch Transfer Creation**: Admin can select multiple pending payouts and trigger a single "Process Batch" command.
- **Idempotency Safeguards**: Each payout linked to a unique transaction ID in the ledger.
- **Status Dashboard**: Visual representation of the batch progress (e.g., "15/100 processed").
- **Error Handling UI**: Clear indication of *why* a specific transfer failed (invalid bank data, insufficient balance).

### 2. Granular Feedback Loops (Quality)
- **Category-Based Rating**: Separate scores for Punctuality, Technical Skill, and Cleanliness.
- **Evidence-Linked Reviews**: Users can attach photos of the finished service directly to the review (Evidence-First).
- **Double-Blind System**: Reviews only become visible when both parties submit or after 7 days, preventing retaliation.
- **Provider Reply**: Allow providers to respond professionally to feedback.

### 3. Service Quality Analytics
- **Dynamic Provider Ranking**: Matching engine prioritizes providers with high "Granular Scores" in specific categories.
- **Quality Flags**: Automatic flagging of providers whose scores drop below a threshold or who have recurring specific complaints (e.g., "Always late").

## Table Stakes vs. Differentiators
| Feature | Type | Rationale |
|---------|------|-----------|
| Individual Transfers | Table Stake | Already exists in v7.0. |
| Double-Blind Reviews | Differentiator | Essential for honest feedback in service industries. |
| Evidence in Reviews | Differentiator | Reinforces the "FACILITA" brand of trust and evidence. |
| Bulk API Integration | Table Stake | Necessary for operational efficiency beyond 10 cities. |
