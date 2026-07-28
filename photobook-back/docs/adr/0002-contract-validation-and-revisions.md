# ADR 0002: Contract validation and immutable revisions

- Status: provisional accepted
- Date: 23 July 2026
- Scope: B1 shared contracts and project persistence

## Decision

The backend compiles the synchronized JSON Schema artifacts with AJV draft
2020-12 and uses the same validator in contract tests and future HTTP command
handling. Redocly validates the synchronized OpenAPI 3.1 graph.

Project documents are immutable `ProjectRevision` rows. A project points to its
latest revision, while each later revision stores:

- the exact base revision;
- a project-scoped client mutation ID;
- a canonical request fingerprint;
- a server-generated canonical document hash;
- the author and revision number.

Autosave runs in a serializable transaction. The latest revision is moved with
a conditional update, so a stale writer cannot silently replace newer work.

## Retry and conflict semantics

- Same mutation ID and same fingerprint returns the original revision.
- Same mutation ID and another fingerprint returns a mutation conflict.
- Another mutation based on a stale revision returns the current latest ID.
- An inaccessible project is indistinguishable from a missing project.
- Failed concurrent writes roll back the candidate revision.

Canonical hashes recursively sort object keys and reject values that cannot be
persisted as JSON. Hashes are server metadata, not a client security boundary.

## Database enforcement

Foreign keys protect project, revision lineage and revision author references.
Unique constraints protect revision numbers, mutation IDs and latest/approved
revision pointers. Check constraints require positive revision numbers and the
expected initial/subsequent lineage shape.

## Evidence

- OpenAPI passes the backend Redocly validator.
- All linked HTTP examples pass backend JSON Schema validation.
- Shared structural valid/invalid document and command vectors behave as
  declared.
- Three migrations apply to an empty disposable PostgreSQL database.
- A real PostgreSQL integration test covers create, save, replay, mutation
  conflict, stale base, ownership hiding and immutable row count.

## Deferred

- Domain-invalid book vectors remain schema-valid until authoritative catalog
  domain validation is implemented.
- HTTP mapping, session/CSRF and project-create idempotency are implemented in
  B2 and documented by ADR 0003.
- Formal `BACKEND_READY` requires immutable frontend/backend commits and the
  handoff acceptance protocol.
