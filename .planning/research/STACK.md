# Research Dimension: Stack (v8.0)

## New Capabilities Required
- **Batch Payout Processing**: Efficiently handling hundreds of transfers to providers in single operations.
- **Enhanced Quality Monitoring**: Automated and manual analysis of service evidence and feedback.

## Recommended Stack Additions

### 1. Payments & Transfers (Pagar.me)
- **Recipients & Transfers API**: Use for programmatic payout execution.
- **Idempotency Keys**: Critical for bulk operations to prevent double-charging/payouts on retry.
- **Webhooks**: Required for real-time reconciliation of transfer statuses (pending -> success/failure).

### 2. Background Processing (BullMQ + Redis)
- **Batch Queues**: Use BullMQ to orchestrate the "batching" logic (collecting payouts over a window or processing a large list).
- **Retry Logic**: Configurable exponential backoff for failed API calls to Pagar.me.

### 3. Quality & Analytics
- **AI Sentiment Analysis**: Optional integration (e.g., OpenAI API) to flag toxic or fraudulent reviews before they are public.
- **PostGIS**: Continue using for geo-fenced quality analysis (e.g., "Which neighborhood has the most punctuality issues?").

### 4. Database (PostgreSQL + Prisma)
- **Advisory Locks**: Use for critical financial sections during bulk processing to ensure consistency.
- **JSONB**: For storing granular feedback metadata and Pagar.me transfer history.

## What NOT to Add
- **New Payment Gateway**: Stay with Pagar.me to avoid operational overhead and maintain single-ledger simplicity.
- **Complex BI Tools**: Use internal dashboards and SQL for now; avoid heavy third-party BI until scale justifies it.
