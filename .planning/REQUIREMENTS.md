# Requirements — FACILITA

## 1. Functional Requirements (FR)

### 1.1 Authentication & Profile
- **FR01**: OTP-based authentication (Phone/SMS) for both Users and Providers.
- **FR02**: Provider Onboarding with mandatory KYC (Document upload + Selfie).
- **FR03**: Provider Profile must include 13 standard service categories initially.
- **FR03.1**: **Advanced Availability**: Providers must define specific availability windows; system tracks "En-route" vs "Busy" status.

### 1.2 Order Management (Closed-Loop)
- **FR04**: User creates order with location, category, and problem description.
- **FR05**: **Cascading Matching Engine**: 
  - 5 min timeout for Top 1 Provider.
  - Expand radius and offer to Top 3 if no response.
  - Escalate to N2 Support after 15 min without match.
- **FR06**: **Evidence Integrity**: 
  - Mandatory "Before" and "After" photos.
  - **Native Camera Enforcement**: System blocks gallery uploads; EXIF validation + server-side timestamp sync.
- **FR07**: Timeline: Real-time status updates (Requested -> Matched -> En-route -> Arrived -> In Progress -> Done).
- **FR07.1**: **Material Catalog**: Standardized parts pricing (disjunctors, faucets) for easy upsell without provider price negotiation.

### 1.3 Communication
- **FR08**: Real-time chat (Stream.io) between User and Provider after matching.
- **FR09**: Voice calling (masked numbers) via Twilio.

### 1.4 Payments & Financials
- **FR10**: Escrow-based payment: User pays at matching/start; funds held until "Done".
- **FR11**: **Split Payment**: Automatic split between Marketplace and Provider.
- **FR12**: **Tiered Payouts**: Bronze (D+15), Prata (D+7), Ouro (D+2).
- **FR13**: Automatic commission reduction for top-tier providers.

### 1.5 Backoffice & Operations
- **FR14**: Fraud detection dashboard flagging "Evidence Recycled" or "Off-platform signals".
- **FR15**: **Tiered Support System**:
  - **N1**: Chatbot/FAQ for 80% of common queries.
  - **N2**: Human Ops for matching delays and SLA breaches (<15 min response).
  - **N3**: Dispute/Fraud specialists for financial resolution (<4h SLA).
- **FR16**: Dispute resolution interface for operational staff.

## 2. Non-Functional Requirements (NFR)

- **NFR01**: **PWA Support**: Client app must work offline and be installable.
- **NFR02**: **Native Mobile**: Provider app must support background geoloc and push notifications.
- **NFR03**: **Security**: JWT-based auth + RLS in database.
- **NFR04**: **Scalability (Modular Hexagonal)**: Backend must be divided into autonomous Bounded Contexts (Identity, Catalog, Matching, Orders, Payments, Evidence, Fraud, Disputes) communicating via Anti-Corruption Layers and Event Bus.
- **NFR05**: **Event-Driven Resilience**: Sychronous flows strictly for financial consistency. All non-blocking tasks (AI, SMS, score calculation, payout releases) MUST be processed via background queues (BullMQ/Redis Pub-Sub).
- **NFR06**: **Geospatial Accuracy**: Matching engine must use PostGIS with **GIST Index** + **Redis Geo** for real-time presence.
- **NFR07**: **Multi-City Ready**: All database schemas must include `city_id` and global settings must be per-region.
- **NFR08**: **Score Integrity**: Multi-dimensional scoring with **Temporal Decay** and behavioral outlier detection.
- **NFR09**: **Database Isolation**: PostgreSQL must use strictly separated schemas per module (`identity`, `catalog`, `orders`, `payments`, etc.). Cross-schema queries are prohibited in application code.

## 3. Compliance
- **Legal**: 30-day "Satisfação Garantida" policy (non-insurance model).
- **Fiscal**: Pagar.me split integration for automatic tax compliance (MEI).
