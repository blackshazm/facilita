# Testing

**Date:** 2026-07-13

## Frameworks
- **Backend (API):** Jest is the primary testing framework (`ts-jest`).
- **Contract Tests:** Contract tests ensure bounded contexts do not violate architectural rules (`npm run test:contracts` matching `ports.contract.spec.ts`).
- **Client (Frontend):** Playwright is configured for End-to-End (E2E) tests (`npm run test:e2e`).

## CI/CD & Gates
- A `pre-merge` script in the API enforces boundary linting (`npm run lint:boundary`), contract tests, and a production build before merging.
- TDD is heavily emphasized by the ECC orchestrator.
