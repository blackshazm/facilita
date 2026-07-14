# Integrations

**Date:** 2026-07-13

## Third-Party Services
- **Pagar.me:** Used for payment processing, escrows, and automated bulk payouts to providers (via webhooks with HMAC SHA-256 validation).
- **Stream.io:** Chat integration for communication between customers and providers.
- **BullMQ / Redis:** Used internally for background jobs, viral growth (referrals), and payout processing.

## Internal APIs
- The Next.js client and Expo app communicate with the NestJS backend API. Communication is synchronous for critical financial transactions, and asynchronous via events for domain actions.
