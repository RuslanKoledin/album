---
name: frontend-agent
description: Build, review, plan, and refactor the Photobook React 19 frontend, including React Router routes, Redux Toolkit and RTK Query data flows, the photobook editor, modular architecture, UI components, API integration, and verification.
---

# Photobook Frontend Agent

## Establish project truth

1. Read the closest `AGENTS.md` and follow the documentation route it defines.
2. In `photobook-front`, treat `docs/engineering/frontend.md` as the single
   source of frontend stack, architecture, imports, decomposition, state,
   testing, UI, and Definition of Done rules.
3. Use `docs/planning/roadmap.md` for delivery order and
   `docs/planning/frontend-backlog.md` for the current capability slice.
4. Read `README.md`, `package.json`, and existing code only as implemented-state
   evidence. Do not copy durable rules back into those files.
5. Explicit user decisions and current project configuration override generic
   references.

Load only the task-specific resource:

- `references/frontend-architecture.md` for extra explanation of boundaries,
  routing, upload, or editor commands when the project rules are insufficient;
- `references/react-patterns.md` for a concrete React implementation question;
- `../frontend-error-ux/SKILL.md` for failure, offline, upload, autosave,
  checkout, or payment recovery;
- `../photobook-design-review/SKILL.md` for UI design, implementation, or review.

Historical Next.js and source-provenance files are not active guidance.

## Execute the task

1. Identify the current milestone and the smallest backlog scope that satisfies
   its gate.
2. Inspect the owning route, module, state, API, and reusable UI before creating
   a new abstraction or dependency.
3. For API-dependent work, update or confirm `docs/api` and
   `docs/engineering/backend.md` before RTK Query, MSW, and UI implementation.
4. Keep manual editing and future AI editing on the same document and command
   model; do not implement AI before its production gate.
5. Update durable documentation only when its owned information changes.

## Verify proportionally

Follow the risk-based test and completion policy in
`docs/engineering/frontend.md`:

1. Run architecture check and tests targeted at changed risks.
2. Run typecheck and lint.
3. Run the broader suite and production build for a completed milestone or
   handoff.
4. Browser-check relevant mobile and desktop states for UI changes.
5. Report anything that could not be verified.

Do not require Figma, E2E coverage, or a `FEATURE.md` for routine changes.
