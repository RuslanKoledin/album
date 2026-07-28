# ADR 0006: Render profile gate before job infrastructure

- Status: provisional accepted
- Date: 23 July 2026
- Scope: B4 render HTTP boundary before M0

## Decision

Expose the DRAFT render create and read routes before adding a render queue,
worker, PDF generator or render-job persistence. The create boundary validates
the authenticated owner, CSRF token, shared request schema, `Idempotency-Key`,
project/approval relationship and approval freshness.

If the approval belongs to the current latest approved revision, the API
returns `RENDER_PROFILE_UNAVAILABLE` because M0 has not supplied an accepted
immutable print profile. It creates no render job, idempotency record or queued
work. If a later revision has made the approval stale, the API returns
`APPROVAL_OUTDATED`.

The read route remains owner-scoped and returns the same safe `404` for an
unknown project or job. No render jobs can exist until the M0 profile gate is
opened.

## Rationale

The HTTP boundary lets frontend and backend agree on auth, ownership, approval
and failure semantics without inventing production geometry or pretending that
a PDF can be manufactured. Persisting placeholder jobs would create false
states and migration debt. Starting Redis/BullMQ before executable render work
would add infrastructure without proving the critical print path.

## Evidence

The disposable PostgreSQL HTTP scenario proves:

- an anonymous create request returns `AUTH_REQUIRED`;
- a current immutable approval returns `RENDER_PROFILE_UNAVAILABLE`;
- the rejected request leaves no idempotency record or render job;
- an unknown job read returns a safe owner-scoped `404`;
- a later saved revision makes the previous approval return
  `APPROVAL_OUTDATED`.

## Deferred

- Accepted immutable print profile and production geometry from M0.
- Render-job persistence, status transitions and idempotent replay.
- Redis/BullMQ worker and retry validation against a failed/cancelled attempt.
- Golden PDF comparison, private PDF storage and operator signed download.
