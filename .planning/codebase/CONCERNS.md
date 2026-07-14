# Concerns & Tech Debt

**Date:** 2026-07-13

## Known Issues & Debt
- **Operational Complexity:** Scaling to multiple cities requires robust bulk capabilities for payouts (partially addressed in v8.1).
- **Service Quality:** Granular feedback loops are needed to maintain the "Evidence-First" quality at scale without manual bottlenecking.
- **Testing Coverage:** While contract tests exist, full E2E coverage across the entire platform flow (Client -> API -> Provider) is complex and must be continuously maintained.

## Security & Reliability
- Critical endpoints (especially payments and identity) require strict rate limiting.
- Webhook endpoints (e.g., Pagar.me chargebacks/payouts) must strictly validate HMAC SHA-256 signatures to prevent fraudulent triggers.
