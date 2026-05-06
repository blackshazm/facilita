# Cross-AI Plan Review Request

You are reviewing implementation plans for a software project phase.
Provide structured feedback on plan quality, completeness, and risks.

## Project Context
FACILITA is a "closed-loop" transactional marketplace focused on urgent domestic services.
Stack: Next.js, Expo, NestJS, Prisma, PostgreSQL (PostGIS), Pagar.me, Stream.io.
Architecture: Modular Hexagonal Evolutivo.

## Phase 6.3: Mobile Production & Publishing
### Roadmap Section
### Phase 6.3: Mobile Production & Publishing [FUNCIONAL]
- [ ] Configurar CI/CD Pipeline via Expo EAS Build & Submit.
- [ ] Implementar Push Notifications (FCM) para eventos críticos.
- [ ] Finalizar Onboarding com Prova de Vida (Selfie) e Documentos.
- [ ] Garantir resiliência offline para visualização de ordens ativas.
- **Requirements**: PRV-01, PRV-02, PRV-03, PRV-04

### Requirements Addressed
- **PRV-01**: Configurar pipeline de CI/CD para o app do prestador.
- **PRV-02**: Implementar sistema de notificações push para o app do prestador.
- **PRV-03**: Finalizar onboarding do prestador com prova de vida e upload de documentos.
- **PRV-04**: Implementar modo offline para visualização de ordens ativas.

### User Decisions (CONTEXT.md)
- **D-01**: Private Document Storage via Pre-signed URLs.
- **D-03**: EAS Profiles: dev, production, and preview (pointing to Prod API).
- **D-04**: UserDevice table for push tokens.
- **D-05**: AsyncStorage for "Offline Lite" persistence.
- **D-07**: Backend NotificationService using `expo-server-sdk`.

### Research Findings (06.3-RESEARCH.md)
- Configuration of `eas.json` with inheritance.
- Use of `expo-server-sdk` for backend push chunking.
- Pattern for secure KYC uploads via pre-signed URLs.
- Use of `NetInfo` for connectivity UI.

### Plans to Review (06.3-PLAN.md)
# Plan — Phase 6.3: Mobile Production & Publishing

## Overview
This plan focuses on hardening the Provider Mobile App for production. We will establish the CI/CD pipeline, implement push notifications, secure onboarding with manual KYC, and provide offline resilience for critical data.

## Requirements Tracking
- **PRV-01**: CI/CD via Expo EAS [WAVE 1]
- **PRV-02**: Push Notifications (End-to-End) [WAVE 3]
- **PRV-03**: Manual KYC & Selfie Validation [WAVE 2]
- **PRV-04**: Offline-First Lite (Active Order/Profile) [WAVE 4]

---

## Wave 1: Infrastructure & Delivery (EAS)

### Task 1.1: Configure EAS Build
- **Action**: Create `apps/provider/eas.json` with `development`, `preview` (staging-like, pointing to prod API), and `production` profiles.
- **Read First**: [apps/provider/app.json](file:///d:/Desktop/facilita/apps/provider/app.json)
- **Acceptance Criteria**:
    - `eas.json` exists with correct profiles.
    - `eas build --profile production --dry-run` completes validation.

### Task 1.2: Update App Configuration
- **Action**: Update `app.json` with production identifiers (bundleId, package name) and `runtimeVersion: { "policy": "appVersion" }`.
- **Read First**: [apps/provider/app.json](file:///d:/Desktop/facilita/apps/provider/app.json)
- **Acceptance Criteria**:
    - `bundleIdentifier` and `package` name are unique and valid.

---

## Wave 2: Identity & Security (Manual KYC)

### Task 2.1: Update Database Schema
- **Action**: Add `UserDevice` and `KycSubmission` models to `schema.prisma`.
- **Read First**: [packages/database/prisma/schema.prisma](file:///d:/Desktop/facilita/packages/database/prisma/schema.prisma)
- **Acceptance Criteria**:
    - `npx prisma format` passes.
    - `UserDevice` has `pushToken`, `userId`, `deviceId`.
    - `KycSubmission` has `selfieUrl`, `documentFrontUrl`, `documentBackUrl`, `status` (PENDING, APPROVED, REJECTED).

### Task 2.2: [BLOCKING] Schema Push
- **Action**: Run `npx prisma db push` to apply changes to the dev database.
- **Acceptance Criteria**: Database updated with new tables.

### Task 2.3: Implement KYC Backend Logic
- **Action**: Create `KycService` in `identity` module to generate Pre-signed URLs and handle submission.
- **Read First**: [apps/api/src/modules/identity/](file:///d:/Desktop/facilita/apps/api/src/modules/identity/)
- **Acceptance Criteria**:
    - Endpoint `POST /identity/kyc/upload-url` returns a temporary S3/Storage URL.
    - Endpoint `POST /identity/kyc/submit` records the submission and sets user status to `KYC_PENDING`.

### Task 2.4: Implement KYC Frontend Flow
- **Action**: Update `RegisterScreen.tsx` to include photo capture steps for Selfie and Documents.
- **Read First**: [apps/provider/src/screens/RegisterScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/RegisterScreen.tsx)
- **Acceptance Criteria**:
    - User can capture 3 photos.
    - Photos are uploaded directly to the pre-signed URLs.

---

## Wave 3: Push Notifications (End-to-End)

### Task 3.1: Create Backend Notification Module
- **Action**: Create `NotificationModule` in `apps/api` using `expo-server-sdk`.
- **Acceptance Criteria**:
    - `NotificationService.sendPushNotification(userId, title, body)` correctly chunks and sends messages.

### Task 3.2: Mobile Push Registration
- **Action**: Add `expo-notifications` and implement token registration on app startup.
- **Read First**: [apps/provider/App.tsx](file:///d:/Desktop/facilita/apps/provider/App.tsx)
- **Acceptance Criteria**:
    - App prompts for permission.
    - `UserDevice` record created in DB with a valid Expo token.

---

## Wave 4: Offline Resilience (Lite)

### Task 4.1: Implement Offline Caching
- **Action**: Use `AsyncStorage` to persist `activeOrder` and `providerProfile` data.
- **Acceptance Criteria**:
    - Closing and opening the app while offline still shows the last fetched order details.

### Task 4.2: Connectivity UI
- **Action**: Add a global `OfflineBanner` component that appears when `NetInfo` detects no internet.
- **Acceptance Criteria**:
    - Banner visible when Airplane mode is ON.
    - Write actions (e.g., "Confirm Order") show an error alert instead of a crash.

---

## Verification Plan

### Automated Tests
- `npm run build --workspace=api` (Verify backend integration)
- `npm run lint --workspace=provider` (Verify mobile code quality)

### Manual Verification
1.  **Build**: Run `eas build --profile preview` and install on a physical device.
2.  **KYC**: Complete registration, upload 3 photos, and verify they appear in the DB.
3.  **Push**: Create a fake order in the DB and verify the device receives the notification.
4.  **Offline**: Open the app, turn off Wi-Fi, and check if the active order is still visible.

## Review Instructions
Analyze each plan and provide:
1. **Summary** — One-paragraph assessment
2. **Strengths** — What's well-designed (bullet points)
3. **Concerns** — Potential issues, gaps, risks (bullet points with severity: HIGH/MEDIUM/LOW)
4. **Suggestions** — Specific improvements (bullet points)
5. **Risk Assessment** — Overall risk level (LOW/MEDIUM/HIGH) with justification

Focus on:
- Missing edge cases or error handling
- Dependency ordering issues
- Scope creep or over-engineering
- Security considerations
- Performance implications
- Whether the plans actually achieve the phase goals
