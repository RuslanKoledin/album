# ADR 0001: Backend foundation

- Status: provisional accepted
- Date: 23 July 2026
- Scope: B0 infrastructure and B1 persistence scaffold

## Decision

Use a modular monolith with Node.js 24 LTS, strict TypeScript, NestJS 11 on
Fastify, PostgreSQL 17 with Prisma 7, and an S3-compatible storage adapter via
AWS SDK. Local development uses pinned PostgreSQL and MinIO containers.

The public HTTP namespace is `/api/v1`. Liveness and readiness stay outside the
versioned business API at `/health/live` and `/health/ready`.

The frontend-owned OpenAPI 3.1 and JSON Schema artifacts are copied into
`packages/contracts/artifacts` with a deterministic SHA-256 digest of the
source contract tree. Backend code never imports frontend runtime modules.

## Boundaries

- Redis, BullMQ and a worker process appear only with media/render jobs.
- AI, payment automation, production SMS and production hosting are excluded.
- Browser uploads will use short-lived signed object-storage instructions.
- PostgreSQL stores metadata and immutable document snapshots, not photo bytes.
- Local object-storage CORS is infrastructure configuration; production bucket
  CORS is owned by production infrastructure.

## Evidence

- PostgreSQL and MinIO containers pass Docker health checks.
- The initial migration applies to an empty disposable PostgreSQL database.
- Storage bootstrap creates or reuses the private local bucket.
- API readiness verifies PostgreSQL and storage with bounded checks.
- Responses and JSON logs use a server-generated request ID.
- Common HTTP failures use the shared error envelope without stack traces.
- Backend lint, typecheck, focused tests and production build pass.

## Pending ratification

- A named backend owner must ratify this decision before `BACKEND_READY`.
- Production hosting, database, object storage, secrets and region are pending.
- Migration rollback/roll-forward policy is pending production operations.
- Production storage/CORS, retention and generated-thumbnail policy remain
  deployment/B3 follow-up work.
