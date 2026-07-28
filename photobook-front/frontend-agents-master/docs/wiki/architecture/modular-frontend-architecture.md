---
type: architecture
status: current
updated: 2026-07-21
sources:
  - ../../photobook-final-spec-and-plan.md
  - agent-assets/frontend/skills/frontend-agent/references/frontend-architecture.md
tags:
  - photobook
  - frontend
  - architecture
---

# Photobook Modular Frontend Architecture

## Structure

The frontend uses `app -> pages -> modules -> shared` plus an independent
`core/book` domain layer.

- `app`: providers, store, routing, global integration, and styles.
- `pages`: thin route-facing composition.
- `modules`: business workflows, endpoint injection, mappings, and domain UI.
- `shared`: small domain-agnostic infrastructure and UI primitives.
- `core/book`: serializable book document, commands, invariants, history
  primitives, and calculations without React, Redux, browser, or network code.

Modules expose small public entry points and avoid cross-module deep imports.
Folders are created only when a workflow is implemented.

Photobook code folders expose `index.ts` barrels using `export * from`.
Cross-folder imports use public aliases; parent-relative imports are forbidden.
UI components, hooks, pure helpers, model, and API files keep separate
responsibilities and follow the consuming project's enforced line budgets.
Standard UI icons come from `react-icons`; unique brand icons use the shared
iconpack.

## Routing and data

- React Router Framework Mode owns all routing.
- Public `/`, `/books`, and `/help` routes are prerendered at build time.
- Private/project routes remain SPA routes and use `noindex` metadata.
- RTK Query with `fetchBaseQuery` owns server state.
- Redux Toolkit owns the durable editor document, committed history, undo/redo,
  meaningful selection, and save/sync status.
- Local React state owns transient interaction such as hover, menus, pointer
  movement, and drag previews.

## Editor command model

Manual editing and future AI assistance use the same typed commands. The
`core/book` layer validates and applies commands, so AI cannot bypass constructor
rules or invent a second document format. High-frequency pointer movement stays
local and commits one meaningful command when the interaction ends.

## Files and uploads

`File`, `Blob`, object URLs, DOM nodes, image elements, and canvas instances do
not enter Redux. Serializable asset metadata may be stored. Original photos are
uploaded directly to object storage through backend-issued signed URLs.

## Detailed reference

See
`agent-assets/frontend/skills/frontend-agent/references/frontend-architecture.md`.
