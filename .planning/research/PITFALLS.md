# Research Dimension: Pitfalls (v8.0)

## 1. Bulk Processing Issues
- **Rate Limiting**: Pagar.me may have limits on concurrent Transfer API calls.
  - *Prevention*: Implement concurrency control in BullMQ (e.g., `limiter` setting).
- **Incomplete Batches**: System crashes mid-batch.
  - *Prevention*: Use database transactions and check status of each item before processing. Every item must have a `batch_id`.

## 2. Review & Feedback Risks
- **Review Retaliation**: Providers harassing users for low scores.
  - *Prevention*: Double-blind system + Anonymity options + Post-service contact restriction (Chat closes after D+7).
- **Incentivized Reviews**: Fake reviews to boost ranking.
  - *Prevention*: Only "Verified Orders" (paid and completed) can leave reviews. Pattern detection for "Review Farming".

## 3. Financial Integrity
- **Stale Balances**: Attempting a payout when the Pagar.me balance is insufficient due to other pending transfers.
  - *Prevention*: Admin dashboard must show "Real-time Pagar.me Balance" vs "Internal Ledger Balance".
- **Double Payout**: Retrying a failed job that actually succeeded in the gateway.
  - *Prevention*: Mandatory use of `idempotency_key` (Internal Ledger UUID).

## 4. Operational Bloat
- **Manual Verification**: Requiring an admin to approve *every* individual transfer in a batch of 500.
  - *Prevention*: Auto-approval for transfers below a threshold (e.g., R$ 500) if provider is "Verified".
