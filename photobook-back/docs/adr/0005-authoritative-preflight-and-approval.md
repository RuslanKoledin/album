# ADR 0005: Authoritative preflight and immutable approval

- Status: provisional accepted
- Date: 23 July 2026
- Scope: B4 preflight/approval slice

## Decision

The API validates the exact latest immutable `BookDocumentV1` revision against
its immutable catalog version before approval. Structural validation uses the
synchronized JSON Schema. A separate pure domain validator enforces catalog
compatibility, product options, spread/layout geometry, slots, required
content, asset references, text limits and normalized crop/focal coordinates.

Every preflight result is persisted as a completed immutable run bound to one
project and revision. Domain failures become blocking issues with stable codes
and exact `surfaceId`/`elementId` targets. Trusted ready-asset dimensions produce
low-resolution warnings at the provisional 240 DPI threshold. The threshold
remains subject to the production specification gate.

Approval requires the latest revision, a succeeded preflight run for that same
revision, a complete checklist and acknowledgement of the exact warning set.
The first accepted request creates one immutable approval; an identical retry
returns that record. A later revision preserves the old audit record but moves
the project back to editing and requires a new preflight and approval.

## Persistence invariants

- Composite foreign keys bind project, preflight run and approved revision to
  the same project and revision.
- A revision and preflight run can each be approved at most once.
- Preflight issues must be a JSON array and completion timestamps must match
  the terminal status.
- Approval checklist must be a JSON object and its request hash cannot be empty.
- Serializable transactions and conditional project updates prevent an
  approval or preflight from racing a newer revision.
- Re-running preflight for the currently approved revision does not demote the
  project.

## Evidence

- Shared valid and domain-invalid fixtures pass the independent backend domain
  validator.
- The disposable PostgreSQL HTTP scenario proves stale revision rejection,
  exact blocking targets, warning acknowledgement, incomplete checklist
  rejection, immutable approval, idempotent replay and mandatory reapproval
  after a later save.
- A real browser with frontend mocks disabled completed login, project
  creation, editor, server preflight and approval. A subsequent edit saved
  revision 2 and the preview correctly required a new approval. No browser
  console errors or warnings were emitted.

## Deferred

- Production bleed, fold, safe-zone, DPI and color rules pending the signed
  manufacturing specification.
- Render queue, print PDF generation, private PDF storage and operator download.
- Render retry without losing the unchanged approval.
