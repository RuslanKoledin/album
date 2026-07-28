# ADR 0003: Auth, catalog and project API

- Status: provisional accepted
- Date: 23 July 2026
- Scope: B2 local/test walking skeleton

## Decision

The B2 API implements the synchronized auth, catalog, provisional pricing and
project contracts without introducing Redis, a queue or an external identity
service.

Phone authentication uses short-lived database challenges. OTP, contact,
requester IP and session secrets are stored only as keyed hashes. Verification
is single-use and attempt-limited. A successful verification creates an opaque
HttpOnly `SameSite=Lax` cookie and returns an in-memory CSRF token derived from
the session secret.

The fake OTP is available only in local/test. Staging and production startup is
blocked until a production SMS provider and its operational configuration are
accepted.

## Project and catalog semantics

- Published catalog versions are immutable and seeded explicitly.
- The provisional price endpoint validates product, spread and option
  compatibility against the selected catalog version.
- Project create validates the frozen request schema and catalog compatibility,
  then creates the project and initial immutable revision in one transaction.
- Project create idempotency is scoped to the owner and protected by a
  transaction advisory lock, request hash and stored original response.
- Project reads and autosave are owner-scoped; foreign and absent identifiers
  produce the same safe `404`.
- Autosave preserves the immutable revision and retry/conflict semantics from
  ADR 0002.
- A protected request without a cookie returns `AUTH_REQUIRED`; a request with
  a no-longer-active cookie returns `SESSION_EXPIRED`. Session bootstrap remains
  a safe `200` anonymous response so the frontend can recover through login.

## Error and security semantics

All expected failures use the frozen error envelope with request ID, stable
error code, retryability and schema-valid field errors. Rate-limited auth
responses include `Retry-After`.

Cookie values, authorization data, phone numbers, OTP codes, CSRF values and
signed URL fields are redacted from application logs. Production cookie
security is enabled by configuration; production startup remains intentionally
blocked until the provider/origin decision is complete.

## Evidence

- Six migrations apply to an empty disposable PostgreSQL database.
- The HTTP integration test covers catalog, provisional pricing, anonymous
  session, invalid and valid OTP, cookie/CSRF, project list/create/get,
  idempotency replay/conflict, autosave replay/stale conflict and actual
  database session expiry.
- The original repository integration test still covers immutable revision
  counts and ownership hiding.
- A real browser with frontend MSW disabled completed login, project creation,
  editor load and autosave against this API.

## Deferred

- Production SMS, origin/domain values and secret management.
- Cursor pagination beyond the current MVP limit of 50 projects.
- Upload/assets are implemented by ADR 0004; generated thumbnails and cleanup
  remain B3 follow-up work.
- Preflight and approval are implemented by ADR 0005; render jobs remain
  deferred within B4.
