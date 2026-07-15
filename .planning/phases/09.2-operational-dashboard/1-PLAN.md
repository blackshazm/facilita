---
wave: 1
depends_on: []
files_modified:
  - apps/api/src/modules/analytics/analytics.controller.ts
  - apps/api/src/modules/analytics/analytics.service.ts
  - apps/api/src/modules/payments/payments.controller.ts
  - apps/api/src/modules/payments/payments.service.ts
  - apps/api/src/modules/payments/entities/audit-log.entity.ts
  - apps/client/src/app/admin/dashboard/page.tsx
  - apps/client/src/app/admin/dashboard/layout.tsx
  - apps/client/src/components/dashboard/summary-cards.tsx
  - apps/client/src/components/dashboard/drill-down-list.tsx
  - apps/client/src/components/dashboard/payout-controls.tsx
autonomous: true
---

# Phase 09.2: Operational Dashboard - Implementation Plan

## Verification Criteria
- [ ] Financial metrics endpoint returns aggregated data successfully.
- [ ] Quality metrics endpoint returns snapshot data and trend indicators.
- [ ] Payout control endpoint pauses/resumes BullMQ queues and creates an audit log entry.
- [ ] Dashboard layout renders correctly at `/admin/dashboard`.
- [ ] Summary cards fetch and display data via polling every 30s.
- [ ] Bulk Payout control modal requires typing "CONFIRMAR" to execute.

## Phase Must-Haves
- Must use polling (no WebSockets).
- Must adhere to UI-SPEC design constraints (Spacing, Typography, Color).

---

<task>
<id>backend-analytics</id>
<description>Create endpoints for Financial and Quality metrics in the Analytics module.</description>
<read_first>
- apps/api/src/modules/analytics/analytics.controller.ts
</read_first>
<action>
1. Add `GET /analytics/financial` returning `payouts` and `chargebacks` totals.
2. Add `GET /analytics/quality` returning `ratings` and `disputeRatios` with a `trend` indicator (e.g., 'up', 'down', 'stable').
</action>
<acceptance_criteria>
- `analytics.controller.ts` contains `getFinancialMetrics` and `getQualityMetrics` methods.
- Integration tests or manual verification show 200 OK responses with the defined JSON structures.
</acceptance_criteria>
</task>

<task>
<id>backend-payments</id>
<description>Create endpoints to control Bulk Payouts and log the actions.</description>
<read_first>
- apps/api/src/modules/payments/payments.controller.ts
- apps/api/src/modules/payments/payments.service.ts
</read_first>
<action>
1. Create a new `AuditLog` entity/schema for tracking payout actions.
2. Add `POST /payments/bulk/pause` and `POST /payments/bulk/resume`.
3. In the service, interact with BullMQ to pause/resume the queues.
4. Insert a record into `AuditLog` with the admin's ID, action, and timestamp.
</action>
<acceptance_criteria>
- `payments.controller.ts` contains `pauseBulkPayouts` and `resumeBulkPayouts`.
- `payments.service.ts` calls BullMQ `queue.pause()` and `queue.resume()`.
- An audit log is inserted on every trigger.
</acceptance_criteria>
</task>

<task>
<id>frontend-dashboard-layout</id>
<description>Scaffold the Operational Dashboard page and layout in the client app.</description>
<read_first>
- apps/client/src/app/admin/layout.tsx
</read_first>
<action>
1. Create `apps/client/src/app/admin/dashboard/layout.tsx` and `page.tsx`.
2. Apply the default layout wrappers.
3. Configure SWR or React Query at the page level with a `refreshInterval` of 30000 (30 seconds) to fetch financial and quality data.
</action>
<acceptance_criteria>
- `apps/client/src/app/admin/dashboard/page.tsx` exists and renders without errors.
- Code contains polling configuration (`refreshInterval: 30000` or equivalent).
</acceptance_criteria>
</task>

<task>
<id>frontend-summary-cards</id>
<description>Build the summary cards for Financial and Quality metrics.</description>
<read_first>
- apps/client/src/app/admin/dashboard/page.tsx
- .planning/phases/09.2-operational-dashboard/09.2-UI-SPEC.md
</read_first>
<action>
1. Create `apps/client/src/components/dashboard/summary-cards.tsx`.
2. Build 4 cards: Total Payouts, Total Chargebacks, Average Rating, Dispute Ratio.
3. Use the `shadcn` Card component.
4. Display trend arrows (up/down) next to the metrics.
</action>
<acceptance_criteria>
- `summary-cards.tsx` exists and exports the `SummaryCards` component.
- The component receives metric props and displays them.
</acceptance_criteria>
</task>

<task>
<id>frontend-payout-controls</id>
<description>Build the Bulk Payouts control component with the confirmation modal.</description>
<read_first>
- .planning/phases/09.2-operational-dashboard/09.2-UI-SPEC.md
</read_first>
<action>
1. Create `apps/client/src/components/dashboard/payout-controls.tsx`.
2. Add a primary CTA button (e.g., "Halt Payouts" or "Resume Payouts") using the destructive or primary color.
3. Clicking the button opens a `shadcn` Dialog/Modal.
4. The modal must contain a text input where the user types "CONFIRMAR". The action button inside the modal should be disabled until the input matches exactly.
5. On confirm, send the POST request to the payments API.
</action>
<acceptance_criteria>
- `payout-controls.tsx` exists and contains a Dialog component.
- The form has an input that requires the string "CONFIRMAR" to enable the submit button.
</acceptance_criteria>
</task>
