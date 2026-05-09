# Requirements — Milestone v8.0: Operational Excellence

## 1. Scalable Financial Operations (Bulk Payouts)
- [ ] **PAY-04**: **Batch Payout Processing**. Admin can select multiple pending payouts and execute them in a single batch operation.
- [ ] **PAY-05**: **Payout Conciliation Webhooks**. System must automatically reconcile internal ledger statuses based on Pagar.me transfer events.
- [ ] **PAY-06**: **Batch Idempotency Control**. Every payout in a batch must be linked to a unique transaction ID to prevent duplicate transfers on retries.

## 2. Granular Quality Loops (Feedback)
- [ ] **QUAL-01**: **Multi-Category Service Rating**. Users must rate providers in specific categories: Punctuality, Technical Skill, and Cleanliness.
- [ ] **QUAL-02**: **Double-Blind Review System**. Reviews (text and scores) only become visible after both parties have submitted or after a 7-day window.
- [ ] **QUAL-03**: **Evidence-Linked Feedback**. Users can attach up to 3 photos of the completed service as evidence within the review flow.

## 3. Operational Oversight
- [ ] **OPS-02**: **Real-time Financial Gateway Balance**. Admin dashboard must display the actual balance available in Pagar.me versus the internal ledger.

## Future Requirements (Backlog)
- **QUAL-04**: Dynamic Provider Ranking based on granular scores.
- **OPS-03**: Automated Review Moderation via AI Sentiment Analysis.

## Out of Scope for v8.0
- **Automated Payout Thresholds**: Auto-approval of payouts below R$ 500 (deferred to v8.2).
- **External BI Integration**: Exporting data to Tableau/PowerBI.

## Traceability Matrix

| ID | Description | Phase | Status | Outcome |
|---|---|---|---|---|
| PAY-04 | Batch Payout Processing | 08.1 | Pending | |
| PAY-05 | Payout Conciliation Webhooks | 08.2 | Pending | |
| PAY-06 | Batch Idempotency Control | 08.1 | Pending | |
| QUAL-01 | Multi-Category Service Rating | 08.3 | Pending | |
| QUAL-02 | Double-Blind Review System | 08.3 | Pending | |
| QUAL-03 | Evidence-Linked Feedback | 08.3 | Pending | |
| OPS-02 | Real-time Financial Gateway Balance | 08.1 | Pending | |
