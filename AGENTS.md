# AGENTS.md

## 1. Mission

Build the photobook MVP incrementally and verifiably. Work only on the single active task in `tasks/current/`. The master specification is a reference, not a request to implement the whole product.

## 2. Mandatory reading order

Before changing files:

1. Read this `AGENTS.md`.
2. Read the active task file in `tasks/current/`.
3. Read only the specification sections and requirement IDs referenced by that task.
4. Read relevant ADRs and `docs/decisions/DECISIONS.md`.
5. Inspect existing code, tests, migrations, and public contracts.

Do not scan unrelated parts of the repository unless needed to understand a dependency or prevent a regression.

## 3. Task scope rules

- Implement only the active task.
- Do not start another backlog item.
- Do not perform opportunistic refactors outside the scope.
- Do not change product behavior that is not required by the task.
- Do not resolve a `TBD` by guessing.
- Do not use Mixbook behavior as a replacement for this specification.
- If a requirement is ambiguous, contradictory, impossible, unsafe, or depends on an unresolved decision, set the task to `BLOCKED` and document the exact blocker.

## 4. Status authority

Allowed Codex status transitions:

- `READY -> IN_PROGRESS`
- `IN_PROGRESS -> BLOCKED`
- `IN_PROGRESS -> IMPLEMENTED`

Codex must never set:

- `VERIFIED`
- `DONE`

These statuses require human review.

## 5. Required plan before implementation

For every task, first update its `Implementation plan` section with:

- affected modules;
- data or API contract changes;
- migrations;
- tests to add or update;
- security/privacy impact;
- rollback considerations.

For non-trivial work, share the plan before broad changes. Keep the plan tied to acceptance criteria.

## 6. Completion requirements

A task may be set to `IMPLEMENTED` only when all of the following are true:

- every in-scope acceptance criterion has evidence;
- required tests were created and passed;
- lint/typecheck/build passed when relevant;
- migrations were tested forward and backward when rollback is supported;
- no unresolved placeholder, fake implementation, disabled test, or hidden exception remains;
- API/schema documentation is updated;
- security and privacy checks were considered;
- changed files and commands are listed in the task file;
- known limitations are explicit.

If a required check cannot be run, the task is not complete. Record the limitation and use `BLOCKED` or leave `IN_PROGRESS`.

## 7. Evidence rules

Do not write only “tests passed”. Record:

- exact command;
- exit status;
- short result summary;
- relevant screenshot or artifact path for UI/render work;
- manual steps that still require human verification.

Never fabricate command output, screenshots, coverage, performance numbers, or production results.

## 8. Testing expectations

- Add tests close to the behavior being changed.
- Prefer behavior and contract tests over implementation-detail tests.
- Every bug fix must include a regression test when technically possible.
- Do not remove or weaken tests to make a task pass.
- Do not change expected snapshots without explaining why the product output changed.
- UI tasks require responsive checks and at least one narrow/mobile viewport.
- Renderer tasks require deterministic fixtures and visual or geometry comparison.
- Payment and webhook tasks require idempotency tests.
- Permission changes require positive and negative authorization tests.
- Upload tasks require retry, resume, invalid file, and ownership tests.

## 9. Security baseline

- Never hardcode secrets, passwords, tokens, private keys, or production endpoints.
- Never create fallback secrets or default credentials.
- Never print secrets or user photographs in logs.
- Validate authorization server-side for every project, asset, order, and admin action.
- Validate file content, not only file extension.
- Use cryptographically secure identifiers and randomness.
- Do not disable CSRF, TLS verification, authorization, validation, or security headers as a workaround.
- Do not add insecure HTTP fallbacks to production configuration.
- Do not use empty or ignored exception handlers.
- Do not commit `.env`, uploaded files, generated PDFs, credentials, or customer data.

## 10. Data and migration rules

- Schema changes require an explicit migration.
- Migrations must be safe for the expected dataset and deployment model.
- Avoid destructive changes without a documented backfill and rollback/restore plan.
- Persist immutable snapshots for approved documents, order prices, product versions, and payment-relevant data.
- Do not mutate historical orders when catalog data changes.
- Preserve schema and renderer version information in book documents.

## 11. API rules

- Define request, response, error, auth, and idempotency behavior.
- Do not silently change an existing contract.
- Update OpenAPI/schema fixtures when a contract changes.
- Use stable machine-readable error codes.
- Enforce ownership and role checks on the server.
- Prefer idempotent retry-safe operations for uploads, generation, order creation, payment callbacks, and rendering jobs.

## 12. Frontend rules

- Treat server price, authorization, validation, and order state as authoritative.
- Do not trust client-calculated totals.
- Preserve unsaved state or clearly block destructive navigation.
- Every async operation needs loading, success, empty, error, retry, and offline/connection-loss behavior where relevant.
- Do not introduce free-position editing that violates the constrained MVP editor.
- Keep mobile behavior within the task acceptance criteria; do not claim full mobile support from a desktop-only implementation.

## 13. AI and automation rules

- AI output is untrusted input and must pass schema and business validation.
- AI must not bypass locks, product rules, price warnings, or print validation.
- Store model/prompt/engine versions needed for reproducibility.
- Use deterministic fallbacks where the specification requires them.
- Do not claim AI quality without benchmark evidence.
- Do not send user photographs or sensitive metadata to an external service unless the approved architecture and privacy decision explicitly allow it.

## 14. Git rules

- One task per branch: `task/<TASK-ID>-<short-slug>`.
- Keep commits focused and include the task ID in commit messages.
- Do not rewrite shared history.
- Do not merge your own task.
- Do not commit generated dependencies, local caches, secrets, test customer data, or production media.
- Before finishing, show `git status` and summarize the diff.

## 15. Prohibited shortcuts

Do not:

- mark incomplete UI as complete because an API exists;
- mark an API complete without authorization and error tests;
- use a static fake instead of the required integration unless the task explicitly requests a stub;
- leave `TODO`, `FIXME`, commented-out code, disabled tests, or placeholder buttons without documenting them as out of scope;
- implement multiple roadmap tasks in one diff;
- alter acceptance criteria after implementation to match the produced code;
- update `MASTER_SPEC.md` to hide a mismatch.

## 16. Closeout format

At the end of the task, update the task file and report:

1. Status: `IMPLEMENTED` or `BLOCKED`.
2. What changed.
3. Acceptance criteria evidence.
4. Tests and exact commands.
5. Files changed.
6. Migrations/contracts changed.
7. Known limitations.
8. Human verification steps.
9. Recommended next task, without starting it.
