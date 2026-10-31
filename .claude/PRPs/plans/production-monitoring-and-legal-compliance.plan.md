# Plan: Production Monitoring, Healthchecks and Legal Compliance

## Summary
Implement enterprise-grade production healthchecks (`/health`, `/health/ready`, `/health/live`) and Prometheus metrics (`/metrics`) in NestJS, alongside essential legal compliance pages (`/termos`, `/privacidade` under LGPD guidelines) and fallback UX error boundaries (`not-found.tsx`, `error.tsx`) in Next.js. This ensures automated orchestrator recovery, APM observability, and store approval readiness (Google Play and Apple App Store).

## User Story
As a platform operator and user,
I want automated health probes, metric scrapers, standard legal terms, and clear error recovery pages,
So that the cluster can self-heal on failures, Prometheus can track performance, stores can approve mobile apps, and users never encounter unhandled crashes.

## Problem → Solution
- **Problem**:
  1. NestJS lacks `/health` and `/metrics` routes, causing `docker-compose.prod.yml` Prometheus scraping and container health checks to fail or return 404.
  2. Next.js does not have Terms of Service and Privacy Policy pages, which is an immediate rejection blocker for Google Play & App Store app submissions and violates LGPD requirements.
  3. No custom 404 or 500 error boundaries exist in `apps/client/src/app`, risking unstyled white-screen errors on route typos or unexpected frontend runtime exceptions.
- **Solution**:
  1. Build a zero-dependency `HealthModule` in `apps/api` validating PostgreSQL (Prisma) and Redis connectivity, plus a `MetricsModule` exposing standard Prometheus metrics via `prom-client`.
  2. Implement responsive, production-ready `/termos` and `/privacidade` pages adhering to Brazilian law (Marco Civil da Internet & LGPD).
  3. Create branded `not-found.tsx` and `error.tsx` error boundaries in `apps/client/src/app`.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A (Production Readiness Phase)
- **PRD Phase**: Production Hardening & Compliance
- **Estimated Files**: 8-10 files

---

## UX Design

### Before
```
┌─────────────────────────────────┐
│ Cliente / Robô de Monitoramento │
└────────────────┬────────────────┘
                 │
                 ▼
     GET /health or /termos
                 │
                 ▼
         [ HTTP 404 Not Found ]
 (Falha de Healthcheck e Rejeição em Lojas)
```

### After
```
┌──────────────────────────────────────┐
│  Prometheus / Docker / Coolify VPS   │
└──────────────────┬───────────────────┘
                   │ GET /health & /metrics
                   ▼
┌──────────────────────────────────────┐
│ 200 OK: DB & Redis Up + Prometheus   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Usuário / Avaliador Google & Apple  │
└──────────────────┬───────────────────┘
                   │ /termos & /privacidade
                   ▼
┌──────────────────────────────────────┐
│  Documentos Jurídicos LGPD Claros    │
│  + 404 / 500 UX Resiliente com Retry │
└──────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| `GET /health` | 404 Cannot GET /health | 200 `{ status: "ok", services: { db: "up", redis: "up" } }` | Self-healing container probe |
| `GET /metrics` | 404 Cannot GET /metrics | 200 `text/plain` Prometheus scrape output | Connects to `infra/prometheus.yml` |
| Route `/termos` | 404 Page | Formal Terms of Service (regras de repasse, garantia e cancelamento) | Required for Google/Apple publishing |
| Route `/privacidade` | 404 Page | LGPD Privacy Policy (tratamento de dados, cookies, exclusão) | Required for Google/Apple publishing |
| Unmatched URL | Default Next.js 404 | Styled Tailwind dark-mode 404 with home button | Polished user experience |

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `apps/api/src/app.module.ts` | 1-47 | Main module registration for Health and Metrics |
| P0 (critical) | `apps/api/src/shared-kernel/database/prisma.service.ts` | 1-13 | Prisma client reference for DB ping |
| P1 (important) | `infra/prometheus.yml` | 1-15 | Prometheus job configuration for scrape target |
| P1 (important) | `apps/client/src/app/layout.tsx` | 1-40 | Client layout and typography/styling |

---

## Patterns to Mirror

### CONTROLLER_PATTERN
// SOURCE: apps/api/src/modules/catalog/interface/catalog.controller.ts:4-17
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.check();
  }
}
```

### PRISMA_CONNECTIVITY_PING
// SOURCE: apps/api/src/shared-kernel/database/prisma.service.ts:5-8
```typescript
await this.prisma.$queryRaw`SELECT 1`;
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `apps/api/src/modules/health/health.controller.ts` | CREATE | Exposes `/health`, `/health/ready`, `/health/live` |
| `apps/api/src/modules/health/health.service.ts` | CREATE | Probes PostgreSQL & Redis health |
| `apps/api/src/modules/health/health.module.ts` | CREATE | Encapsulates health dependencies |
| `apps/api/src/modules/health/health.controller.spec.ts` | CREATE | Unit tests for health endpoints |
| `apps/api/src/modules/metrics/metrics.controller.ts` | CREATE | Exposes `/metrics` in Prometheus format |
| `apps/api/src/modules/metrics/metrics.module.ts` | CREATE | Registers metrics controller |
| `apps/api/src/app.module.ts` | UPDATE | Imports `HealthModule` and `MetricsModule` |
| `apps/client/src/app/termos/page.tsx` | CREATE | Terms of service page in Portuguese (PT-BR) |
| `apps/client/src/app/privacidade/page.tsx` | CREATE | Privacy policy page under LGPD regulations |
| `apps/client/src/app/not-found.tsx` | CREATE | Custom 404 error page |
| `apps/client/src/app/error.tsx` | CREATE | Global Next.js error boundary with retry |
| `apps/client/src/app/page.tsx` | UPDATE | Footer links to `/termos` and `/privacidade` |

## NOT Building

- Custom paid APM agents (Datadog, New Relic) — strictly using $0 Prometheus & self-hosted standards.
- Complex user consent cookie banner modal with database sync — out of scope for this pass; plain LGPD compliance document is sufficient.

---

## Step-by-Step Tasks

### Task 1: Create Healthcheck Module in `apps/api`
- **ACTION**: Create `health.service.ts`, `health.controller.ts`, and `health.module.ts`.
- **IMPLEMENT**:
  - `HealthService.check()`: Executes `prisma.$queryRaw` SELECT 1 to verify database and checks memory usage (`process.memoryUsage()`) + process uptime.
  - Return shape:
    ```json
    {
      "status": "ok",
      "timestamp": "2026-10-31T22:00:00.000Z",
      "uptime": 1234.56,
      "services": {
        "database": "up",
        "memory": { "rssMb": 85, "heapUsedMb": 42 }
      }
    }
    ```
- **MIRROR**: Standard NestJS controller and service pattern.
- **IMPORTS**: `@nestjs/common`, `PrismaService`.
- **VALIDATE**: `curl http://localhost:3333/health` returns status `ok`.

### Task 2: Create Prometheus Metrics Module in `apps/api`
- **ACTION**: Install `prom-client` in `apps/api` (if not present) or implement standard metric exporter.
- **IMPLEMENT**: Create `MetricsController` mapping `GET /metrics` returning Prometheus text format with standard process metrics and HTTP metrics.
- **VALIDATE**: `curl http://localhost:3333/metrics` returns `# HELP process_cpu_user_seconds_total`.

### Task 3: Register Health and Metrics in `AppModule`
- **ACTION**: Edit `apps/api/src/app.module.ts`.
- **IMPLEMENT**: Add `HealthModule` and `MetricsModule` to `imports` array.
- **VALIDATE**: Run `npm --workspace=apps/api test` to verify no module resolution issues.

### Task 4: Create Legal Terms and Privacy Policy Pages in `apps/client`
- **ACTION**: Create `apps/client/src/app/termos/page.tsx` and `apps/client/src/app/privacidade/page.tsx`.
- **IMPLEMENT**: Complete legal text for FACILITA (Regras de prestação, garantia, retenção de taxa de 15%, antifraude, cancelamentos e direitos LGPD do titular).
- **MIRROR**: Dark theme styling (`bg-slate-900`, `text-slate-100`, `emerald-400` accents).
- **VALIDATE**: Verify both pages render cleanly on mobile and desktop viewports.

### Task 5: Create Error Boundaries (`not-found.tsx` and `error.tsx`)
- **ACTION**: Create `apps/client/src/app/not-found.tsx` and `apps/client/src/app/error.tsx`.
- **IMPLEMENT**:
  - `not-found.tsx`: "Página não encontrada" with Home button link.
  - `error.tsx` (`'use client'`): "Ocorreu um erro inesperado" with `reset()` retry button.
- **VALIDATE**: Request non-existing path `/rota-inexistente` and ensure 404 renders.

### Task 6: Add Links to Home Footer
- **ACTION**: Edit `apps/client/src/app/page.tsx` footer section.
- **IMPLEMENT**: Add links `[Termos de Uso](/termos)` and `[Política de Privacidade](/privacidade)`.
- **VALIDATE**: Links are clickable and navigate properly.

---

## Testing Strategy

### Unit Tests
- `apps/api/src/modules/health/health.controller.spec.ts`:
  - Test `/health` returns status `ok` when Prisma query succeeds.
  - Test `/health` returns degraded status if database throws connection error.

### Validation Commands

```bash
# 1. Unit Tests Backend
npm --workspace=apps/api test src/modules/health

# 2. Build Check Frontend
npm --workspace=apps/client run build

# 3. E2E Browser Validation
npm --workspace=apps/client run test:e2e
```

---

## Acceptance Criteria
- [ ] `GET /health` returns HTTP 200 with database health check.
- [ ] `GET /metrics` returns Prometheus format metrics.
- [ ] `/termos` renders full Terms of Service compliant with Brazilian marketplace standards.
- [ ] `/privacidade` renders LGPD compliant policy.
- [ ] `not-found.tsx` and `error.tsx` handle errors gracefully.
- [ ] All tests pass without regressions.

