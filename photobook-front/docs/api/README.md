# Shared API Contracts

This folder contains contract artifacts shared by the frontend, backend, and
future print renderer.

## HTTP API frozen slices

- OpenAPI entry point: `openapi.yaml`.
- HTTP DTO schema: `schemas/http-contract-v1.schema.json`.
- Success and documented error payloads: `examples/`.

The current internally `FROZEN` graph contains four frontend-ready groups. The
first reads an immutable catalog version, creates/gets a project, and autosaves
a full `BookDocumentV1` snapshot as a new immutable revision. The second covers
phone OTP challenge/verify/resend, explicit anonymous or authenticated session
bootstrap, in-memory CSRF bootstrap, and logout. Production SMS provider,
origins and cookie-domain decisions remain backend gates.
Protected requests distinguish a missing login (`AUTH_REQUIRED`) from a
no-longer-active cookie (`SESSION_EXPIRED`); session bootstrap still returns a
successful anonymous response so clients can recover without treating it as an
infrastructure failure.
The third group runs authoritative backend preflight for one immutable revision
and creates an immutable approval after the complete customer checklist and
warning acknowledgement. Its no-mock browser integration is implemented; a
later revision never inherits that approval.
The fourth group reserves upload batches, issues short-lived direct PUT
instructions, completes uploaded JPEG/PNG assets, renews an expired instruction
without changing the asset identity, and reads the current project asset list.
The read model owns processing status, trusted pixel dimensions, and temporary
thumbnail URLs; `BookDocumentV1` keeps only the stable `assetId`. `File`/`Blob`
stay outside all JSON DTOs and RTK Query state. Backend object storage, trusted
JPEG/PNG dimensions and the temporary private-original preview bridge are
implemented; generated thumbnails and formal named-owner acceptance remain
pending.

The same OpenAPI file also contains a `DRAFT` M2 order slice for frontend/MSW
walking-skeleton work. It creates and reads one explicitly mock-only order from
the latest approved revision. It is not a frozen production price, offer,
payment, delivery, or manufacturing contract.

The separate `DRAFT` pricing appendix implements `POST /price-quotes` for the
frontend/MSW flow. It binds a provisional, expiring calculation to the exact
catalog version, product spec, options, spread count and Bishkek delivery
method. Checkout references that `quoteId`; the mock order never trusts or
recalculates a client-supplied amount. The rules and values remain mock-only and
await Product/Production Owner plus backend review.

The DRAFT account/operator appendix adds cursor-shaped customer project and
order lists plus one role-protected read-only admin order detail. The admin
response binds the order to the project, immutable revision summary, approval
and preflight run. It intentionally has no queue, payment mutation, print-file
URL or production status mutation.

The operation-level `DRAFT` render appendix adds create/poll DTOs for an
asynchronous print-PDF job. It binds every attempt to one immutable approval,
derives `renderProfileVersion` on the server and models retry through an
explicit failed/cancelled predecessor without changing approval. Until M0
provides an accepted production profile, the create operation must return
`RENDER_PROFILE_UNAVAILABLE` and queue nothing. Customer responses expose only
PDF metadata, never an object key or download URL.

The backend now executes this pre-M0 gate: it checks session/CSRF, request
schema, idempotency header, ownership and approval freshness. A current approval
returns `RENDER_PROFILE_UNAVAILABLE`; an approval invalidated by a later
revision returns `APPROVAL_OUTDATED`. Neither path creates a job or idempotency
record. Queue, polling states and PDF output remain DRAFT and unimplemented.

Project creation requires session, CSRF, and `Idempotency-Key`; autosave uses
`baseRevisionId` plus `clientMutationId` and documents non-destructive revision
and repeated-mutation conflicts. Mutations also document CSRF failure, business
validation and safe object-level `404` behavior.

Every example is explicitly mock-only and is linked from OpenAPI. Contract tests
validate payloads through JSON Schema draft 2020-12. Redocly recommended rules
lint the complete OpenAPI graph, including external references. Module-owned MSW
fixtures and responses are validated against the same schemas; browser and
Vitest handlers use the same implementation.

The analytics event dictionary is separate from HTTP transport:
`schemas/analytics-event-v1.schema.json` with a mock example under
`examples/analytics/`. It allowlists event names and small properties while
forbidding arbitrary PII. Transport/vendor selection remains an ADR gate.

The frontend readiness review and the exact backend acceptance checklist are in
`backend-handoff.md`. Internal freeze permits MSW development but is not
evidence of `BACKEND_READY` or backend acceptance.

## BookDocumentV1

- Schema: `schemas/book-document-v1.schema.json`.
- Valid fixture:
  `fixtures/book-document/v1/valid/minimal-standard-hardcover.json`.
- Invalid fixtures: `fixtures/book-document/v1/invalid/`.

Schema-invalid fixtures live directly under `invalid/`. Fixtures under
`invalid/domain/` have a valid wire shape but violate invariants that require
configuration or cross-field checks, such as `crop.x + crop.width <= 1`.

The TypeScript source is `src/core/book/model/bookDocumentV1.ts`. A contract
test validates the shared JSON fixtures with JSON Schema draft 2020-12 and
keeps the deterministic TypeScript fixture synchronized with the valid JSON.

All product, layout, theme, asset, and geometry identifiers currently start
with `mock-`. The 200 × 200 mm page and 400 × 200 mm spread are development
geometry, not an approved manufacturing specification. Replace them only after
the M0 print specification is signed and modelled through P1.2 `ProductSpec`.

The document intentionally excludes UI state, local files and object URLs,
price, order, revision metadata, and command history. Project revisions wrap the
document at the API and persistence boundary.

JSON Schema validates the wire shape. Cross-reference, compatibility, unique-ID,
and crop-rectangle sum invariants are enforced by the P1.3 domain validator in
`src/core/book/validation/`. Strict persistence parsing lives in
`src/core/book/serialization/`.

`layoutSlotKey` connects a concrete photo/text element to its immutable
`LayoutSpec` slot. Element `id` remains the unique identity used by commands and
history.

Persistence failures are typed as `invalid_json`,
`unsupported_schema_version`, `invalid_structure`, or `invalid_document` with
domain issues. The migration interface exists, but the migration registry stays
empty until a real second schema version is introduced.

## BookCommandV1 draft

Artifacts:

- Schema: `schemas/book-command-v1.schema.json`.
- Valid vectors: `fixtures/book-command/v1/valid/`.
- Schema-invalid and domain-invalid vectors:
  `fixtures/book-command/v1/invalid/`.
- TypeScript source: `src/core/book/commands/`.

The schema describes one command. A manual or future AI batch is a non-empty
ordered array whose items are validated by this schema. The command schema
reuses photo, text, crop, and spread definitions from `BookDocumentV1`, so a
consumer must register both schemas before compiling the command schema.

`applyBookCommand` validates every candidate document against the same catalog
bundle. Structural and catalog issues reject the command. Missing required
photo/text content is returned as a non-blocking issue so an incomplete draft
remains editable and is blocked only at the later preflight/approval boundary.
Commands never contain UI state, browser objects, or arbitrary layout geometry
that can bypass `LayoutSpec` validation.

`applyBookCommandBatch` is atomic: one failed item rejects the complete batch.
The pure history layer stores one entry per accepted batch, supports undo/redo,
clears redo after a new branch, and keeps the latest 100 operations. History is
not a wire DTO and is never included in project autosave; autosave continues to
send a full `BookDocumentV1` snapshot.

Backend structural validation of the synchronized vectors passes locally as of
23 July 2026. The schema remains `DRAFT` until acceptance is recorded against
immutable frontend/backend commits and the authoritative catalog-domain vectors
are implemented.

## Mock catalog configuration

- Shared fixture:
  `fixtures/catalog/v1/valid/mock-book-config-bundle.json`.
- TypeScript source: `src/core/book/configuration/`.
- Deterministic factory:
  `src/core/book/testing/createMockBookConfigurationBundle.ts`.

The bundle contains one mock product, one theme, one template, and three total
layouts. Its categories are recommendation tags and do not restrict template
compatibility. The DRAFT HTTP representation is now validated by
`schemas/http-contract-v1.schema.json` and linked from OpenAPI. This fixture must
not be exposed as a confirmed production catalog.

Text slots carry a required positive `maxCharacters`. Text styles carry
allowlisted `textAlign` and `colorToken` values, so manual editing, future AI
commands, preview, and backend validation share the same print constraints.
