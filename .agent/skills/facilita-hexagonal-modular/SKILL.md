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
- [ ] `core/` does not import `adapters/`, `shared/`, or other modules.
- [ ] `adapters/` only import `ports/` and external libraries.
- [ ] Cross-module communication uses `EventEmitter`.
- [ ] One contract test (Jest mock) per port.
- [ ] Prisma uses domain prefixes.
- [ ] PRD section tag is present.
</validation_checklist>
