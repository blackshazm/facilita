# Phase 6.2: Fiscal Compliance & Tax Engine

## Overview
This phase implements the fiscal core of the FACILITA platform, ensuring that all transactions are correctly taxed according to current rules and prepared for the **Reforma Tributária 2026 (IBS/CBS)**. It also automates the emission of NFS-e (Notas Fiscais de Serviço) via eNotas and establishes an immutable audit log for financial transparency.

## User Review Required

> [!IMPORTANT]
> **eNotas Credentials**: We will need an eNotas API Key and a Pagar.me Secret Key configured in the eNotas dashboard to enable automated emission.
> **Tax Aliquots**: The 2026 rates (IBS/CBS) are currently estimated. The system will support dynamic configuration to adjust these values once the final regulation is published.

## Proposed Changes

### [Database]
#### [MODIFY] [schema.prisma](file:///d:/Desktop/facilita/packages/database/prisma/schema.prisma)
- Add `Invoice` model in the `payments` schema.
- Add `ibsAmount` and `cbsAmount` fields to `Payment` and `Invoice` models.
- Add `FinancialAuditLog` model in a new `audit` schema.
- Update `Payment` model to include a reference to `Invoice`.

---

### [API - Fiscal Module]
#### [NEW] [fiscal.module.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fiscal/fiscal.module.ts)
#### [NEW] [tax-calculator.service.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fiscal/application/tax-calculator.service.ts)
- Implement `TaxStrategy` pattern: `CurrentTaxStrategy` (ISS/PIS/COFINS) and `Reforma2026Strategy` (IBS/CBS).
- Logic to calculate marketplace commission taxes vs. provider service taxes.
#### [NEW] [enotas-gateway.adapter.ts](file:///d:/Desktop/facilita/apps/api/src/modules/fiscal/infrastructure/enotas-gateway.adapter.ts)
- Integration with eNotas API for NFS-e emission.

---

### [API - Payments Refactoring]
#### [MODIFY] [capture-payment.usecase.ts](file:///d:/Desktop/facilita/apps/api/src/modules/payments/application/capture-payment.usecase.ts)
- Replace hardcoded 80/20 split with a call to the `TaxCalculator`.
- Trigger invoice emission event after successful capture.
#### [MODIFY] [payment-repository.port.ts](file:///d:/Desktop/facilita/apps/api/src/modules/payments/ports/payment-repository.port.ts)
- Add support for fiscal fields.

---

### [API - Security & Audit]
#### [NEW] [financial-audit.interceptor.ts](file:///d:/Desktop/facilita/apps/api/src/shared-kernel/interceptors/financial-audit.interceptor.ts)
- Interceptor that automatically logs state changes in `Payment`, `Wallet`, and `Payout` to the `FinancialAuditLog`.
- Ensure immutability (Append-only logic).

## Verification Plan

### Automated Tests
- **Unit Tests**: Validate `TaxCalculator` for both current and 2026 strategies with edge cases (zero values, high amounts).
- **Integration Tests**: Mock eNotas API response and verify that `CapturePaymentUseCase` correctly creates an `Invoice` record.
- **Audit Test**: Attempt to update/delete an `AuditLog` entry via a test script and ensure it fails at the DB level (if possible to test via Prisma) or verify the `AuditInterceptor` logic.

### Manual Verification
- **Backoffice**: Access the new Fiscal tab (to be implemented in a later phase, or verified via API) to see emitted invoices.
- **eNotas Sandbox**: Verify that a test invoice appears in the eNotas sandbox dashboard after a simulated payment.
