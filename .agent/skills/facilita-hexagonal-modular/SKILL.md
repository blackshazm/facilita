---
name: facilita-hexagonal-modular
description: "Generate, validate, and maintain Modular Hexagonal Evolutive architecture for FACILITA"
---

<objective>
Generate, validate, and maintain the "Modular Hexagonal Evolutive" architecture for the FACILITA project, ensuring strict domain isolation, event-driven communication, and hexagonal patterns.
</objective>

<architecture_rules>
1. **Core Isolation**: `core/` (Entities, Business Rules, Value Objects) must NEVER import from `adapters/`, `shared/`, or other modules.
2. **Hexagonal Contracts**: Use `ports/` as pure interfaces. `adapters/` implement exactly one port. `core/` depends only on ports (DIP).
3. **Application Layer**: Use-cases reside in `application/`. They orchestrate logic, handle DTOs, and use ports. They never access the database directly.
4. **Internal Communication**: No synchronous cross-module calls. Use `@nestjs/event-emitter` or a strongly typed internal API defined in `shared/events/`.
5. **Data Persistence**: Prisma schemas should be logically partitioned by module. No direct cross-module Foreign Keys.
6. **Event Definition**: All cross-module events must be defined in `src/shared/events/`.
</architecture_rules>

<structure_template>
src/modules/{name}/
├── core/          → Entities, rules, value objects
├── ports/         → Interface contracts
├── adapters/      → Implementations (Prisma, Stripe, S3, etc.)
├── application/   → UseCases, DTOs, mappers
└── {name}.module.ts → DI bindings, event listeners, controllers
</structure_template>

<process>
1. **Analyze**: Verify if the request violates architecture boundaries.
2. **Generate**: Create files following the `structure_template`.
3. **Validate**: Apply boundary rules and run contract tests.
4. **Reference**: Tag generated code with PRD sections (e.g., `// PRD: 4.4.1 Pagamento`).
</process>

<examples>
**Port Example:**
```typescript
export interface PaymentGatewayPort {
  authorize(orderId: string, amount: number): Promise<string>;
  capture(paymentIntentId: string): Promise<void>;
  freezeOnDispute(paymentIntentId: string): Promise<void>;
}
```

**Event Example:**
```typescript
export class OrderMatchedEvent {
  constructor(public readonly orderId: string, public readonly providerId: string) {}
}
```
</examples>

<validation_checklist>
**Layer: core/**
- [ ] `core/` does not import `adapters/`, `shared/`, or other modules.
- [ ] No `any` types inside `core/` classes or entities.
- [ ] No `@nestjs/*` decorators inside `core/` classes.

**Layer: ports/**
- [ ] `adapters/` only import `ports/` and external libraries.
- [ ] Each port has at least one contract test using `jest.fn()`.
- [ ] Port is injected via `@Inject(TOKEN)` — never by class reference.

**Layer: application/**
- [ ] Use-cases never import `PrismaService` or any adapter directly.
- [ ] A DTO mapper is present for every use-case input/output.

**Cross-module:**
- [ ] Cross-module communication uses `EventEmitter` only.
- [ ] All integration events are typed classes defined in `src/shared/events/`.
- [ ] Prisma model names use module domain prefix (e.g., `payment_transactions`).
- [ ] PRD section tag is present in every generated file (`// PRD: X.X.X`).
</validation_checklist>

<gsd_integration>
This skill activates within the GSD workflow. Behavior per command:

- **`/gsd-plan-phase`**: Before planning a phase, check if it touches any bounded context. If yes, enforce `<structure_template>` in the PLAN.md task breakdown. Each planned task must reference its hexagonal layer (`core/`, `ports/`, `adapters/`, `application/`).
- **`/gsd-execute-phase`**: During execution, every generated file must pass `<validation_checklist>` before being committed. Tag each file with its PRD section.
- **`/gsd-verify-work`**: Use `<verification_criteria>` to validate hexagonal compliance per domain. Check that no boundary violations exist after execution.
- **`/gsd-code-review`**: Flag any import that violates `enforcement.blockedPatterns` in `skill.json` as **HIGH severity**. Boundary violations block merge.
- **`/gsd-validate-phase`**: Run the full `<validation_checklist>` retroactively on all files generated during the phase.
- **`/gsd-quick`**: Even for quick tasks touching `src/modules/**`, apply `<architecture_rules>` and append the PRD tag.
</gsd_integration>

<migration_strategy>
For brownfield modules not yet following hexagonal patterns, use the **Strangler Fig** approach in 3 distinct phases — never all at once:

**Phase 1 — Wrap**
Create the port interface around the existing implementation without moving any logic:
```typescript
// ports/legacy-order.port.ts
export interface LegacyOrderPort {
  findById(id: string): Promise<Order>;
}
// adapters/legacy-order.adapter.ts — thin wrapper around existing service
```

**Phase 2 — Migrate**
Move business logic from the existing service into `core/` entities and value objects. Update use-cases to depend only on ports. Keep the adapter pointing to old infrastructure temporarily.

**Phase 3 — Extract**
Delete the legacy service. The adapter now calls the new infrastructure (Prisma, Redis, etc.) directly through the port contract. All tests remain green.

**Rules:**
- Never migrate `core/` + `adapters/` + `application/` in the same PR.
- Keep existing tests green throughout all 3 phases.
- Tag each commit with `// MIGRATION: Phase 1|2|3 — {module}`.
- Use `gsd-insert-phase` to add migration phases mid-milestone without disrupting the roadmap.
</migration_strategy>

<event_taxonomy>
Two distinct event types exist in FACILITA and must NEVER be mixed:

**Domain Events** — intra-module, synchronous, in-process
- Live inside the module that emits them (not in `shared/events/`)
- Consumed only by aggregates or services within the same bounded context
- Example: `OrderStatusChangedDomainEvent` emitted inside `OrderAggregate`

**Integration Events** — cross-module, async, via EventEmitter
- MUST be defined in `src/shared/events/`
- Consumed by other modules via `@OnEvent()` listeners
- Payload must be a plain serializable object (no Prisma models, no class instances with methods)
- Named as `{Domain}{Action}Event` (e.g., `OrderMatchedEvent`, `PaymentCapturedEvent`)

```typescript
// src/shared/events/payment-captured.event.ts  — PRD: 4.4.2
export class PaymentCapturedEvent {
  constructor(
    public readonly orderId: string,
    public readonly amount: string,   // BigInt serialized as string
    public readonly capturedAt: Date,
  ) {}
}
```

**Decision Rule:** If the consumer is in a different `src/modules/*` folder → **Integration Event** (goes in `shared/events/`). If consumed within the same module → **Domain Event** (stays local).
</event_taxonomy>

<testing_pyramid>
Each layer has a specific test scope. Tests must not cross layer boundaries upward:

| Layer | Test Type | Tool | Mock Strategy |
|-------|-----------|------|---------------|
| `core/` | Unit tests | Jest | **No mocks** — pure functions and entities only |
| `ports/` | Contract tests | Jest | Mock port with `jest.fn()`, verify contract shape |
| `adapters/` | Integration tests | Jest + Prisma test DB | Real DB, test schema prefix `test_` |
| `application/` | Use-case tests | Jest | Mock all ports; assert orchestration logic |
| Event listeners | Integration tests | Jest + EventEmitter | Emit real event, assert side effects |

**Rules:**
- `core/` tests must have **0 imports** from `@nestjs/*`, `prisma`, or `adapters/`.
- Each port must have at least **1 contract test** using `jest.fn()` implementations.
- Use-case tests must inject mock ports via NestJS `Test.createTestingModule()` or manual DI.
- Adapter integration tests run against a dedicated test schema isolated from development data.
</testing_pyramid>

<anti_patterns>
Common violations caught in FACILITA code reviews — treat all as **HIGH** in `gsd-code-review`:

❌ **Using PrismaService directly in a use-case**
```typescript
// application/create-order.usecase.ts — WRONG
constructor(private prisma: PrismaService) {}
async execute() { await this.prisma.order.create(...) }
```
✅ Inject a port: `constructor(@Inject(ORDER_REPO_PORT) private repo: OrderRepositoryPort) {}`

---

❌ **Cross-module FK in Prisma schema**
```prisma
model Payment {
  order   Order  @relation(fields: [orderId], references: [id])  // WRONG
}
```
✅ Store only the raw ID as a plain field with no `@relation`: `orderId String`

---

❌ **Importing another module's service directly**
```typescript
// orders/application/create-order.usecase.ts — WRONG
import { ProviderService } from '../../providers/provider.service';
```
✅ Emit `OrderCreatedEvent` and let the providers module react via `@OnEvent()`.

---

❌ **Untyped event payload**
```typescript
this.eventEmitter.emit('order.matched', { orderId, providerId }); // WRONG
```
✅ Use a typed class: `this.eventEmitter.emit('order.matched', new OrderMatchedEvent(orderId, providerId));`

---

❌ **`any` type in core entities**
```typescript
export class Order { metadata: any } // WRONG
```
✅ Define a value object: `export class OrderMetadata { constructor(readonly notes: string) {} }`

---

❌ **Missing `@Inject()` token for port**
```typescript
constructor(private repo: OrderRepositoryPort) {} // WRONG — NestJS won't resolve an interface
```
✅ `constructor(@Inject(ORDER_REPOSITORY_PORT) private repo: OrderRepositoryPort) {}`
</anti_patterns>

<verification_criteria>
UAT criteria for `gsd-verify-work` per critical domain. Format: Given / When / Then.

**payments** (`PRD: 4.4`)
- Given a payment is authorized, When captured, Then `PaymentCapturedEvent` is emitted with `orderId` and `amount` as a BigInt string.
- Given a dispute is opened, Then `freezeOnDispute` is called on `PaymentGatewayPort` and no direct Prisma call exists in the use-case.

**orders** (`PRD: 4.2`)
- Given an order is created, When matched to a provider, Then `OrderMatchedEvent` is emitted — not a direct service call.
- Given the orders module is loaded, Then no import from `payments/` or `providers/` module exists in `application/` or `core/`.

**antifraud** (`PRD: 4.6`)
- Given evidence is submitted, When EXIF location is outside the order geofence, Then `EvidenceRejectedEvent` is emitted via EventEmitter.
- Given the antifraud module processes an event, Then it consumes only `shared/events/` types — never internal types from other modules.

**disputes** (`PRD: 4.5`)
- Given a dispute is resolved, Then `DisputeResolvedEvent` is emitted and the payment module reacts via `@OnEvent()`.
- Given dispute logic lives in `core/`, Then zero NestJS decorators (`@Injectable`, `@Controller`) exist inside `core/` classes.

**evidence** (`PRD: 4.7`)
- Given evidence is stored, Then the adapter uses `EvidenceStoragePort` and the use-case never references the S3 SDK directly.
- Given the module is validated, Then all Prisma model names carry the `evidence_` prefix.
</verification_criteria>

<shared_kernel>
Everything in `src/shared/` is owned by **no single module** and must be framework-agnostic where possible:

```
src/shared/
├── events/          → Integration event classes (cross-module, typed, serializable)
├── errors/          → Base domain error classes (DomainError, NotFoundError, ForbiddenError)
├── types/           → Shared TypeScript types and enums (TierId, OrderStatus, EvidenceType)
├── decorators/      → Custom NestJS decorators (@CurrentUser, @Roles, @IsPublic)
├── guards/          → Auth guards used across modules (JwtAuthGuard, RolesGuard)
├── filters/         → Global exception filters (DomainExceptionFilter)
├── pipes/           → Global validation pipes (ZodValidationPipe)
└── utils/           → Pure utility functions (date formatting, BigInt serialization, geo helpers)
```

**Rules:**
- `shared/events/` → typed class, plain serializable payload, no methods beyond the constructor.
- `shared/errors/` → extend `DomainError extends Error`; always include a `code: string` field.
- `shared/types/` → `enum` or `const` objects only — zero business logic.
- `shared/utils/` → pure functions only — no class instances, no NestJS DI.
- Nothing in `shared/` may import from `src/modules/*`. Violation = architecture boundary break.
</shared_kernel>
