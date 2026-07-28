# Photobook Backend Agent Instructions

These rules apply to every task in `photobook-back`. Explicit user decisions
override project recommendations.

## Before a task

1. Read `README.md` and the relevant ADR or module.
2. Read the frontend-owned contract status in
   `../photobook-front/docs/api/README.md`.
3. For HTTP work, use the synchronized artifacts in
   `packages/contracts/artifacts` as the wire source of truth.
4. For milestone order and business gates, read
   `../photobook-front/docs/planning/roadmap.md`.

## Boundaries

- Keep one modular monolith. Do not introduce microservices, GraphQL, queues,
  Redis, payment automation or AI infrastructure before their milestone.
- Controllers map HTTP only. Domain rules belong in services/domain modules;
  persistence belongs in repositories or `packages/database`.
- Validate external payloads against the synchronized OpenAPI/JSON Schema
  artifacts. Do not create a second incompatible DTO contract.
- Keep opaque IDs, idempotency, object ownership, immutable revisions and
  optimistic concurrency explicit.
- Never log OTP values, cookies, authorization headers, signed URLs, phone
  numbers or customer photo metadata.
- Store photo bytes in private object storage, never PostgreSQL.

## Completion

- Run formatting, lint, typecheck, focused tests and build.
- For persistence or storage changes, verify against real local containers.
- Update durable documentation only when architecture, contract status or
  milestone evidence changes.
