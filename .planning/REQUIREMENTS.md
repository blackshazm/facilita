# Requirements — v7.0: Expansion & Payouts

## 1. Payout Automation & Financial Control
- **PAY-01: Automated Payout Scheduler**
    - The system must aggregate released balances in the Wallet and schedule batch transfers to providers via Pagar.me.
    - Support for custom scheduling (e.g., Weekly on Fridays).
- **PAY-02: Advanced Wallet Visualization**
    - Providers must see "Released" vs "Pending" (escrow) balances.
    - Transaction history must include "Payout" entries linked to bank transfer IDs.
- **PAY-03: Bank Account Verification**
    - Providers must be able to register and validate bank accounts (CNPJ/CPF must match).

## 2. Regional Expansion
- **EXP-01: Multi-City Service Discovery**
    - Service catalog must be filterable by City/Region.
    - Providers must define their specific "Service Zones" (Geo-fencing).
- **EXP-02: Regional Availability Logic**
    - The matching engine must prioritize providers within the same city/region to reduce lead time.

## 3. Viral Growth (Referral)
- **GROW-01: Referral Invitation System**
    - Users and Providers can generate unique invitation codes.
    - Tracking of "Invited By" during the registration flow.
- **GROW-02: Reward Engine**
    - Automatic credit of R$ X to the referrer's Wallet after the referee completes their first successful order (Status: DONE).
- **GROW-03: Referral Anti-Fraud**
    - Limit of N referrals per user/device.
    - Block rewards for self-referrals (IP/Device/Phone matching).

## 4. Operational Oversight
- **OPS-01: Payout Monitoring Dashboard**
    - Admin must view and manually override/block payouts for flagged accounts.

## Traceability Matrix

| ID | Description | Assigned Phase | Status |
|---|---|---|---|
| PAY-01 | Automated Payout Scheduler | 7.1 | [x] |
| PAY-02 | Advanced Wallet Visualization | 7.1 | [x] |
| PAY-03 | Bank Account Verification | 7.1 | [x] |
| EXP-01 | Multi-City Service Discovery | 7.2 | [x] |
| EXP-02 | Regional Availability Logic | 7.2 | [x] |
| GROW-01 | Referral Invitation System | 7.3 | [x] |
| GROW-02 | Reward Engine | 7.3 | [x] |
| GROW-03 | Referral Anti-Fraud | 7.3 | [x] |
| OPS-01 | Payout Monitoring Dashboard | 7.4 | [ ] |
