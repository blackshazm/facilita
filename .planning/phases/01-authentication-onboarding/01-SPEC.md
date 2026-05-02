# Phase 1: Authentication & Onboarding (SPEC)

## 1. What Are We Building?
This phase implements the identity boundary of the platform. We are establishing the authentication mechanism for Users and Providers, the provider KYC onboarding flow, and the provider availability logic.

## 2. Technical Specifications & Agreements

### 2.1 WhatsApp OTP Authentication (Replaces SMS)
- **Mechanism**: The platform will use WhatsApp as the primary channel for delivering OTPs (One-Time Passwords).
- **Provider**: Twilio (Verify API) or Zenvia, leveraging the official WhatsApp Business API.
- **Security**: 
  - Frontend will implement **Cloudflare Turnstile** (or reCAPTCHA v3) to prevent bot-driven OTP flooding.
  - Backend will implement **NestJS Throttler** (e.g., max 3 OTP requests per phone number per 15 minutes).

### 2.2 Provider KYC Flow (Manual Approval)
- **Data Collection**: During onboarding, providers must submit standard data, a photo of their ID (RG/CNH), and a selfie.
- **Storage**: Images will be uploaded directly to AWS S3 (or Cloudflare R2) via pre-signed URLs to keep binary data out of the NestJS instances.
- **Validation**: For Phase 1, the system will insert the provider into an `ApprovalQueue` table with a `PENDING` status. Backoffice operators will manually approve/reject them. Automated API validation (CAF/IDWall) is deferred to future scale phases.

### 2.3 Application-Level Data Isolation (Replaces Native Postgres RLS)
- **Mechanism**: Multi-tenancy and row-level data access will be enforced at the **Application Layer (NestJS)**, not via Postgres RLS.
- **Implementation**: The JWT token will contain the `userId` and `role`. NestJS Global Guards and Interceptors will automatically extract this and enforce that all Prisma queries include `where: { userId: currentUserId }` (where applicable).

### 2.4 Advanced Availability Engine
- **Model**: Providers will set **Recurring Weekly Slots** (e.g., Monday to Friday, 08:00 to 18:00).
- **Real-Time Override**: Providers will have a global **"Estou Online / Offline"** toggle.
- **Matching Criteria**: The PostGIS matcher (in future phases) will only consider a provider eligible if:
  1. The current time falls within their recurring weekly slot.
  2. Their global toggle is set to `Online`.
  3. They are not currently engaged in an active "En-route" or "In-progress" order.

## 3. Database Schema Updates (Identity Module)
- `User` table: Store phone number, role, and verification status.
- `ProviderProfile` table: Linked to `User`, stores CPF/CNPJ, categories (from the 13 standards), rating, and availability slots.
- `KycSubmission` table: Stores S3 URIs for ID and selfie, plus approval status (`PENDING`, `APPROVED`, `REJECTED`).

## 4. Deliverables
1. NestJS `IdentityModule` with auth controllers (Request OTP, Verify OTP).
2. NestJS Guards for JWT validation and role-based access.
3. S3 Pre-signed URL generation service for KYC uploads.
4. Prisma schema updates for the `identity` schema.
