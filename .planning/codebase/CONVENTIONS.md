# Conventions

**Date:** 2026-07-13

## Coding Standards
- **Language:** Strict TypeScript is used across the stack.
- **Formatting:** Prettier is enforced via Husky pre-commit hooks.
- **Linting:** ESLint is used. Architectural boundaries in the API are enforced using `eslint-plugin-boundaries` (running on `src/modules`).
- **Domain Isolation:** Each backend module must maintain its business rules agnostic to external frameworks (pure TypeScript) and not leak its database schema.

## GSD Framework
- All changes must follow the **GSD (Get Shit Done)** framework: `Spec -> Discuss -> Plan -> Secure -> Execute -> Verify`.
- Work is broken down into milestones and phases tracked in the `.planning/` directory.
