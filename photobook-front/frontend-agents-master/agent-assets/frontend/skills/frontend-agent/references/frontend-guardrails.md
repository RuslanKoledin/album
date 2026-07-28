---
type: decision
status: current
updated: 2026-07-21
tags:
  - photobook
  - frontend
  - architecture
---

# Photobook Frontend Guardrails

## Decisions

- Keep React Router Framework Mode. Do not introduce a second router.
- Keep Redux Toolkit and RTK Query. Do not add TanStack Query or Zustand for
  overlapping responsibilities.
- Use `fetchBaseQuery`; add Axios only after an explicit architecture decision.
- Keep `core/book` framework-agnostic and deterministic.
- Represent manual and future AI edits with the same typed book commands.
- Keep non-serializable browser objects outside Redux.
- Protect `shared` with domain-agnostic admission rules.
- Prefer project-owned UI. Do not add a component kit automatically.
- Use build-time prerender only for public SEO routes; keep the editor a SPA.
- Optimize bundle splitting or memoization only after measurement.

## Current exclusions

The first stage intentionally excludes Next.js, Axios, TanStack Router,
TanStack Query, Zustand, Ant Design, Zod, i18next, and Sentry. These are not
forbidden forever, but adding one requires a concrete need, alternatives
considered, and user approval.

## Consequences

- Server data remains in the RTK Query cache.
- Durable editor changes remain observable as Redux actions and can support
  history, replay, debugging, autosave, and AI command batches.
- Pointer-frequency interaction remains local so Redux history is meaningful.
- Public pages can be indexed without operating a permanent SSR server.
- Architecture documentation changes only for durable decisions, not routine
  implementation details.
