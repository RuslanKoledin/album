# Backend review handoff: frozen frontend contract slices

> Status: `FROZEN` by internal Product Owner decision
>
> Frontend readiness review: project slice completed 21 July 2026; auth, create-flow, review, upload and asset-read slices completed 22 July 2026
>
> Backend acceptance: pending before `BACKEND_READY`

This document is the acceptance sheet for the first shared HTTP contract. It
was frozen internally so frontend mock development can continue without an
assigned backend owner. This decision permits MSW and RTK Query implementation;
it does not claim backend implementation readiness or integration acceptance.

## Review scope

The review covers:

- `POST /api/v1/auth/challenges`;
- `POST /api/v1/auth/challenges/{challengeId}/verify`;
- `POST /api/v1/auth/challenges/{challengeId}/resend`;
- `GET /api/v1/auth/session`;
- `POST /api/v1/auth/logout`;

- `GET /api/v1/catalog/versions/{catalogVersion}`;
- `POST /api/v1/projects`;
- `GET /api/v1/projects/{projectId}`;
- `PUT /api/v1/projects/{projectId}/document`;
- `POST /api/v1/projects/{projectId}/upload-batches`;
- `GET /api/v1/projects/{projectId}/assets`;
- `POST /api/v1/projects/{projectId}/assets/{assetId}/complete`;
- `POST /api/v1/projects/{projectId}/assets/{assetId}/renew-upload`;
- `POST /api/v1/projects/{projectId}/preflight-runs`;
- `POST /api/v1/projects/{projectId}/approvals`;
- `BookDocumentV1`, the immutable catalog bundle, common HTTP DTOs and linked
  examples used by these operations.

Production pricing rules, thumbnail generation jobs, asset deletion, render
jobs and payments remain separate future contract groups. The provisional price
appendix, project/order lists and order/operator reads below are DRAFT and are
not part of this frozen review scope.

## Draft M2 pricing appendix

`POST /api/v1/price-quotes` is frontend-ready through RTK Query and MSW but
remains operation-level `DRAFT`. It accepts the exact catalog version, product
and product spec, option selections, spread count, quantity and Bishkek
delivery method. The response is provisional, expires and is not an offer.
`POST /orders` now references `priceQuoteId`; the mock rejects a missing,
expired or configuration-mismatched quote instead of trusting a client amount.
Backend may review this appendix in parallel, but pricing rules require M0 and
must not be marked production-ready.

## Draft M2 order appendix

`POST /api/v1/orders` and `GET /api/v1/orders/{orderId}` are included in
OpenAPI with operation-level `DRAFT` status so frontend can complete the mock
walking skeleton. They use an idempotency key, require the latest approved
revision, and return an immutable contact/delivery/price snapshot. The mock
price, test-condition acknowledgement and absence of a real quote/offer/payment
mean this appendix is not part of the frozen backend acceptance scope. Backend
may review it in parallel but must not label it `BACKEND_READY` yet.

The separate analytics schema freezes only names and safe payload shape. Event
transport remains pending an ADR and is not an HTTP endpoint in this slice.

`GET /api/v1/projects`, `GET /api/v1/orders` and
`GET /api/v1/admin/orders/{orderId}` form a separate operation-level `DRAFT`
appendix. Customer lists use the shared cursor page shape. The admin read
requires the backend to authorize `operator` from the server session and
returns an immutable approval/preflight context without the full document or a
print-file URL. These operations are excluded from the frozen acceptance scope.

## Normative artifacts

- `openapi.yaml` — paths, security, headers and response matrix;
- `schemas/http-contract-v1.schema.json` — HTTP DTO definitions;
- `schemas/book-document-v1.schema.json` — revision document wire shape;
- `fixtures/catalog/v1/valid/mock-book-config-bundle.json` — catalog response;
- `fixtures/book-document/v1/` — valid and invalid document vectors;
- `examples/` — all linked request, success and error payloads.

`src/core/book` is the frontend implementation of domain validation. It is a
reference for behavior, not a backend runtime dependency.

## Accepted frontend semantics proposed to backend

| Operation        | Security                              | Success                     | Documented recovery/errors                                                                       |
| ---------------- | ------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------ |
| Catalog version  | public                                | `200` immutable bundle      | `404 CATALOG_VERSION_UNAVAILABLE`                                                                |
| Create project   | session, CSRF, idempotency key        | `201 ProjectDetail`         | `401`, `403 CSRF_INVALID`, `409 IDEMPOTENCY_KEY_REUSED`, `422 VALIDATION_FAILED`                 |
| Get project      | session, object ownership             | `200 ProjectDetail`         | `401`, safe `404 RESOURCE_NOT_FOUND`                                                             |
| Save document    | session, CSRF, optimistic concurrency | `200` new revision metadata | `401`, `403 CSRF_INVALID`, safe `404`, `409` revision/mutation conflict, `422 VALIDATION_FAILED` |
| List assets      | session, object ownership             | `200 AssetList`             | `401`, safe `404 RESOURCE_NOT_FOUND`                                                             |
| Reserve uploads  | session, CSRF, idempotency key        | `201` batch + instructions  | `401`, `403`, safe `404`, `409 IDEMPOTENCY_KEY_REUSED`, `422 VALIDATION_FAILED`                  |
| Complete upload  | session, CSRF, object ownership       | `200 Asset`                 | `401`, `403`, safe `404`, `409 ASSET_UPLOAD_INCOMPLETE`, `422 VALIDATION_FAILED`                 |
| Renew upload     | session, CSRF, object ownership       | `200` fresh instruction     | `401`, `403`, safe `404`, `409 ASSET_UPLOAD_INCOMPLETE`                                          |
| Run preflight    | session, CSRF, latest revision        | `201 PreflightRun`          | `401`, `403`, safe `404`, `409` stale revision, `422` invalid document                           |
| Approve revision | session, CSRF, completed preflight    | `201` new / `200` existing  | `401`, `403`, safe `404`, `409` mismatched revision/run, `422` incomplete checklist or warnings  |

Auth/session semantics:

| Operation         | Security              | Success                          | Documented recovery/errors                                              |
| ----------------- | --------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| Create challenge  | public + Origin check | `201` neutral challenge          | `422 VALIDATION_FAILED`, `429 RATE_LIMITED`, `503` provider unavailable |
| Verify challenge  | public + Origin check | `200` user + CSRF, cookie set    | `401` invalid/expired code, `422`, `429`                                |
| Resend challenge  | public + Origin check | `200` refreshed challenge        | `401` expired, `429`, `503`                                             |
| Session bootstrap | public                | `200` authenticated or anonymous | `429 RATE_LIMITED`                                                      |
| Logout            | session + CSRF        | `204`, cookie cleared            | `401 AUTH_REQUIRED`, `403 CSRF_INVALID`                                 |

Retry and conflict rules:

1. Repeating project creation with the same `Idempotency-Key` and identical
   body returns the original `201` response and creates nothing new.
2. Reusing that key with another body returns
   `409 IDEMPOTENCY_KEY_REUSED`.
3. Repeating autosave with the same `clientMutationId`, `baseRevisionId` and
   document returns the original `200` response and creates no new revision.
4. Reusing `clientMutationId` with another payload returns
   `409 CLIENT_MUTATION_ID_REUSED`.
5. A stale `baseRevisionId` returns `409 PROJECT_REVISION_CONFLICT` with the
   safe `latestRevisionId`; neither version is overwritten.
6. A project outside the current user's object-level access is indistinguishable
   from a missing project and returns the documented `404`.
7. `documentHash` is produced by the server. Frontend treats it as opaque
   revision metadata and does not attempt to reproduce server canonicalization.
8. Approval is bound to the exact `revisionId` and `preflightRunId`. A later
   save preserves the old audit record but returns the project to editing.
9. Repeating approval for the same revision returns the existing approval with
   `200`; it does not create a second record.
10. Repeating upload-batch creation with one idempotency key and identical body
    returns the original asset IDs and instructions; another body returns
    `409 IDEMPOTENCY_KEY_REUSED`.
11. Completing the same verified object is idempotent and returns the same
    asset. Size/media mismatch or a missing object never marks it uploaded.
12. Renewing an expired instruction preserves `assetId`, object key and
    `clientFileId`; it only replaces the short-lived URL, headers and expiry.
13. A fresh asset-list read may replace an expired thumbnail URL without
    changing `assetId`. Frontend refetches on focus/reconnect and never stores
    the temporary URL inside `BookDocumentV1`.

## Backend acceptance checklist

The backend owner records evidence for every item before `BACKEND_READY`:

- [x] OpenAPI 3.1 graph passes the backend validator.
- [x] All linked HTTP examples pass the backend JSON Schema validator.
- [x] Valid, schema-invalid and domain-invalid `BookDocumentV1` fixtures produce
      the expected result in authoritative backend validation.
- [x] Catalog versions and project revisions are immutable in persistence.
- [x] `ProjectDetail` and initial revision can be implemented without an
      undocumented field or `any` payload.
- [x] Idempotency uniqueness scope, request fingerprint and stored original
      response are defined for project creation.
- [x] `clientMutationId` uniqueness scope, request fingerprint and stored
      original response are defined for autosave.
- [x] The stale-base transaction cannot silently overwrite a newer revision.
- [x] Object-level authorization produces the safe `404` behavior.
- [ ] Production origins, cookie attributes and CSRF bootstrap are compatible
      with the declared session/CSRF model.
- [x] Auth challenge responses do not reveal whether a phone is registered.
- [x] OTP values are hashed, short-lived, single-use and absent from logs.
- [x] Contact/IP rate limits and `Retry-After` match the documented recovery.
- [x] Session bootstrap implements the exact authenticated/anonymous union.
- [x] Logout atomically invalidates the session and clears its cookie.
- [x] Preflight issues are bound to the requested immutable revision.
- [x] Blocking issues, incomplete checklist and unacknowledged warnings reject
      approval without creating an approval record.
- [x] A new revision cannot inherit or mutate an older approval.
- [x] Repeating approval for the same unchanged revision returns one record.
- [x] Upload batch idempotency preserves the original batch and asset IDs.
- [x] Signed PUT instructions are short-lived, scoped to one object key and use
      a CORS policy that exposes the completion ETag to the browser.
- [x] Complete verifies object existence, expected size and media type and is
      idempotent for an already completed asset.
- [x] Renew keeps the same asset/object identity and cannot renew an asset that
      is already completed or belongs to another project.
- [x] Asset list returns only assets owned by the requested project and applies
      the same safe object-level `404` rule as project detail.
- [x] Asset status, trusted pixel dimensions and temporary thumbnail expiry are
      derived by backend storage/media processing rather than client claims.
- [x] Temporary preview access is private and a repeated list read can refresh
      its URL while preserving the stable asset identity.
- [ ] Expired URL, controlled storage rejection and retry pass against the
      backend test object storage without losing the frontend local-file map.
- [ ] SMS provider, production origins and cookie domain are recorded in ADRs.
- [x] Unknown fields and unsupported `schemaVersion` are rejected as specified.
- [x] Provisional backend implementation accepts the B2 wire shape without a
      requested contract change; formal named-owner acceptance remains pending.

## Acceptance execution protocol

Acceptance is performed against one immutable frontend commit and one backend
commit. A review of a moving branch or a successful frontend MSW test is not
backend acceptance.

1. Record the artifact commits, backend environment and reviewer below.
2. Run the repository validation commands from the recorded frontend commit.
3. Validate the same OpenAPI, schemas, examples and invalid fixtures with the
   authoritative backend validator.
4. Run backend integration tests for session/CSRF, object ownership,
   concurrency, idempotency and immutable revisions.
5. Run the upload lifecycle against test object storage, including expired URL,
   ETag/completion, mismatched size/type and thumbnail URL refresh.
6. Execute the complete frontend flow with `VITE_ENABLE_MOCKS=false` against the
   recorded backend environment.
7. Attach logs or CI links to every checklist group. Secrets, OTP values, signed
   URLs and customer data must be redacted.
8. Record `ACCEPTED`, `CHANGES_REQUESTED` or `BLOCKED` per contract group. Only
   accepted groups become `BACKEND_READY`.

Required evidence bundle:

- validator and contract-test logs;
- backend integration-test report;
- object-storage proof with redacted request IDs;
- frontend no-mock smoke result;
- ADR references for runtime, database, origins, cookie/CSRF, SMS and storage;
- decision-log entries for every contract change request.

## Acceptance record

| Field                    | Value |
| ------------------------ | ----- |
| Frontend contract commit | —     |
| Backend commit           | —     |
| Test environment         | —     |
| Reviewer and date        | —     |
| Evidence bundle          | —     |
| Open changes             | —     |

| Contract group               | Result    | Evidence | Notes                                        |
| ---------------------------- | --------- | -------- | -------------------------------------------- |
| Auth/session/CSRF            | `PENDING` | —        | Production origins and provider ADR required |
| Catalog/project/revision     | `PENDING` | —        | —                                            |
| Upload/assets/object storage | `PENDING` | Local B3 | Technical proof passed; named review pending |
| Preflight/approval           | `PENDING` | Local B4 | Technical proof passed; named review pending |

Overall result: `PENDING`.

The overall result may change to `BACKEND_READY` only when every frozen group
needed by the first no-mock flow is `ACCEPTED`, all required evidence is linked
and no breaking change is unresolved. Draft pricing, orders, payments and print
delivery retain their own statuses and do not inherit this result.

## Commands for review

```bash
pnpm openapi:lint
pnpm vitest run src/shared/api/openapi.contract.test.ts \
  src/core/book/bookDocumentV1.contract.test.ts \
  src/core/book/bookDocumentV1.validation.test.ts \
  src/core/book/bookCommandV1.contract.test.ts
```

## Decision log

| Date       | Reviewer                   | Result                   | Notes                                                                                                                                                                                                                                                                       |
| ---------- | -------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-21 | Frontend readiness review  | Ready for backend review | Added missing CSRF, create-validation, object-level save `404`, and repeated mutation-ID semantics.                                                                                                                                                                         |
| 2026-07-21 | Product Owner              | Internal freeze          | Repeated instruction to continue accepted as the documented internal-freeze option. Frontend may implement MSW; backend acceptance waits.                                                                                                                                   |
| 2026-07-21 | Frontend text-controls     | Internal freeze revision | Added mandatory catalog `maxCharacters`, `textAlign`, and `colorToken`; BookDocumentV1 and BookCommandV1 wire shapes remain unchanged.                                                                                                                                      |
| 2026-07-22 | Frontend auth P6.1         | Internal auth freeze     | Added phone challenge, verification, resend, session bootstrap and logout schemas/examples; provider and production-origin decisions remain pending.                                                                                                                        |
| 2026-07-22 | Frontend create P6.2       | Frontend integration     | The UI now consumes the frozen session and `POST /projects` contracts with CSRF and stable idempotent retry. Seeded photo selection is mock-only; no upload field or wire change was introduced.                                                                            |
| 2026-07-22 | Frontend review P7         | Frontend integration     | Added revision-bound preflight and immutable approval DTOs, examples, RTK Query, MSW and recovery UI. Print render remains outside this slice.                                                                                                                              |
| 2026-07-22 | Frontend upload P6.3       | Internal upload freeze   | Added upload-batch, direct PUT, complete and renew contracts with linked examples, RTK Query/MSW lifecycle, progress, cancel and retry.                                                                                                                                     |
| 2026-07-22 | Frontend asset read model  | Internal asset freeze    | Added project asset list with processing status, trusted dimensions and replaceable temporary thumbnails. The document continues to store only stable asset IDs.                                                                                                            |
| 2026-07-22 | Product architecture       | Provisional B0 decision  | Node.js/NestJS, PostgreSQL/Prisma, S3 adapter and later BullMQ worker selected for scaffold; Backend owner ratification and infrastructure evidence remain pending.                                                                                                         |
| 2026-07-23 | Backend B1 implementation  | Technical evidence       | Backend OpenAPI/example validation passes; immutable revision persistence, canonical fingerprints, replay and stale-base conflict semantics pass against disposable PostgreSQL. Formal acceptance still requires immutable commits and no-mock HTTP evidence.               |
| 2026-07-23 | Backend B3 implementation  | Technical evidence       | Frozen upload/asset endpoints pass disposable PostgreSQL + real MinIO integration, actual URL expiry/renew, metadata verification, private preview and no-mock browser upload/reload. Generated thumbnails, delete/retention and formal named-owner acceptance remain open. |
| 2026-07-23 | Backend B4 preflight slice | Technical evidence       | Authoritative document validation, revision-bound preflight issues and immutable approval pass disposable PostgreSQL and the no-mock browser flow. A later save requires reapproval. Print render and formal named-owner acceptance remain open.                            |
| —          | Backend owner              | Pending                  | Required before `BACKEND_READY`; breaking feedback follows the normal contract change process.                                                                                                                                                                              |
