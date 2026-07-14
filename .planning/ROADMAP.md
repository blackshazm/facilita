# Roadmap — Milestone v8.0: Operational Excellence

## Phase 08.1: Bulk Payout Foundation
**Goal**: Enable administrative batch processing of provider payouts with strict safety controls.
- **Requirements**: PAY-04, PAY-06, OPS-02.
- **Success Criteria**:
    - Admin can select 10+ payouts and process them with one click.
    - Payouts are blocked if gateway balance is insufficient (Real-time check).
    - Idempotency keys prevent double transfers during manual retry.

## Phase 08.2: Payout Resilience & Automation
**Goal**: Automate the reconciliation of payout statuses via gateway webhooks.
- **Requirements**: PAY-05.
- **Success Criteria**:
    - Internal ledger status updates from `Pending` to `Paid` automatically on Pagar.me confirmation.
    - Failed transfers trigger an internal alert/log for admin review.

## Phase 08.3: Advanced Feedback Loops
**Goal**: Implement the "Evidence-First" granular review system to safeguard platform quality.
- **Requirements**: QUAL-01, QUAL-02, QUAL-03.
- **Success Criteria**:
    - Users can rate Punctuality, Technique, and Cleanliness separately.
    - Photos of the service are displayed alongside the review text.
    - Reviews remain hidden until both sides participate or the timeout expires.

## Phase 08.4: Milestone Formal Verification
**Goal**: Produce all missing VERIFICATION.md and SUMMARY.md artifacts, and ensure test coverage meets Nyquist requirements to formally close Milestone v8.0.
- **Requirements**: PAY-04, PAY-05, PAY-06, QUAL-01, QUAL-02, QUAL-03, OPS-02
- **Gap Closure**: Closes gaps from audit

## Milestone v8.0 Summary
- **Total Phases**: 4
- **Total Requirements**: 7
- **Estimated Effort**: Medium
