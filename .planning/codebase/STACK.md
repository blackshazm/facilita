# Tech Stack

**Date:** 2026-07-13

## Core Stack
- **Frontend (Client):** Next.js 15, React 19, TailwindCSS v4, Recharts, Lucide React
- **Frontend (Provider):** React Native Expo (SDK 50), React Navigation v7
- **Backend (API):** NestJS v10 (Node.js)
- **Database:** PostgreSQL (with PostGIS implied) + Prisma ORM

## Tooling & Monorepo
- **Package Manager:** npm@10.8.2
- **Workspaces:** Turborepo (`turbo` ^2.0.0)
- **Testing:** Jest (API), Playwright (Client E2E)
- **Linting & Formatting:** ESLint 8, Prettier, Husky

## Backend Specifics
- **Event-Driven:** BullMQ + Redis for asynchronous processing
- **Auth:** Passport JWT
- **Other:** Class Validator / Class Transformer for DTO validation
