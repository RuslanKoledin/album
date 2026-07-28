---
type: decision
status: current
updated: 2026-07-21
sources:
  - AGENTS.md
  - agent-assets/frontend/skills/frontend-agent/SKILL.md
tags:
  - photobook
  - frontend
  - architecture
---

# Photobook Frontend Architecture Guardrails

## Decision

Use React 19, TypeScript, Vite, React Router Framework Mode, Redux Toolkit, RTK
Query with `fetchBaseQuery`, Tailwind CSS, Vitest, and Testing Library.

Do not add Next.js, Axios, TanStack Router, TanStack Query, Zustand, Ant Design,
Zod, i18next, or Sentry during the first stage without an explicit architecture
decision approved by the user.

Keep `shared` domain-agnostic and keep `core/book` independent. Manual and
future AI editing must use the same typed command model.

## Rationale

The product is centered on a stateful visual editor, not a conventional data
dashboard. Redux actions and a pure command layer provide observable document
changes, undo/redo, replay, autosave, debugging, versioning, and a future AI
integration surface. RTK Query covers remote data without introducing a second
cache library. React Router already provides the required SPA routing and
build-time public prerender.

## Consequences

- New work expands the chosen Redux/RTK Query architecture instead of migrating
  to TanStack/Zustand by default.
- Non-serializable photo/browser objects remain outside Redux.
- High-frequency pointer state stays local and commits final commands.
- Imported generic sources are historical references, not active defaults.
