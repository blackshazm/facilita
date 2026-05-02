# Phase 1: Authentication & Onboarding (PLAN)

## 1. Scope
Implementing the identity boundary, WhatsApp OTP, and KYC onboarding.

## 2. Implementation Steps
- [x] Prisma schema updates for Identity schema.
- [x] NestJS IdentityModule scaffolding.
- [x] JWT Strategy and Guards.
- [x] OTP Request/Verify Logic (Twilio Mock).
- [x] KYC Submission Logic (S3 Mock).

## 3. Threat Model (STRIDE)

<threat_model>
| threat_id | category | component | disposition | mitigation_plan |
|-----------|----------|-----------|-------------|-----------------|
| T1-OTP-FLOOD | Denial of Service | IdentityModule | MITIGATE | Implement NestJS Throttler (Rate Limiting) on /auth/otp/request. |
| T1-JWT-LEAK | Information Disclosure | SharedKernel | MITIGATE | Use short-lived JWTs (1h) and secure secret management. |
| T1-KYC-PUBLIC | Information Disclosure | Infrastructure | MITIGATE | Ensure S3 bucket is private and use Pre-signed URLs for restricted access. |
| T1-IDOR-PROFILE| Privilege Escalation | IdentityModule | MITIGATE | Application-level isolation via @CurrentUser decorator and Prisma filtering. |
| T1-BRUTE-OTP | Spoofing | IdentityModule | MITIGATE | Limit OTP verification attempts (e.g., 5 attempts per code). |
</threat_model>

## 4. Verification Plan
- [x] Cold Start Test.
- [x] Request OTP Endpoint Test.
- [x] Verify OTP Endpoint Test.
