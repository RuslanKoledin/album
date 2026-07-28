---
type: architecture
status: current
updated: 2026-07-21
tags:
  - photobook
  - frontend
  - architecture
---

# Photobook Frontend Architecture

## Dependency direction

```text
app -> pages -> modules -> core/book
  \       \        \----> shared
   \-------\------------> shared
```

- `app` composes the application and may import every lower layer.
- `pages` compose route screens from module public APIs and shared primitives.
- `modules` own business workflows and may import `core/book` and `shared`.
- `shared` must remain domain-agnostic and must not import upper layers.
- `core/book` is a pure domain package and must not import any UI, state, router,
  browser, or network library.

## Folder ownership

```text
src/
  app/
    providers/
    routes/
  pages/
  modules/
    auth/
    project/
    photo-upload/
    editor/
    checkout/
    order/
  core/
    book/
  shared/
    api/
    hooks/
    ui/
    lib/
```

Create module folders only when implementing the workflow. Do not prebuild an
empty folder tree.

## Shared admission rules

Allowed in `shared`:

- the RTK Query base API and generic error normalization;
- domain-agnostic UI primitives and accessibility helpers;
- generic hooks, formatting helpers, configuration, and technical types;
- app-wide infrastructure that knows nothing about books, projects, or orders.

Keep inside the owning module:

- injected RTK Query endpoints and domain DTO mapping;
- forms, validation rules, filters, mutations, and workflow state;
- project, editor, upload, checkout, order, and authentication UI;
- business-specific types and copy.

Expose module functionality through a small `index.ts`. Cross-module imports go
through public entry points and should remain rare.

## Routing and prerender

Use the existing React Router Framework Mode configuration.

- Prerender public discovery routes such as `/`, `/books`, and `/help` at build
  time for search indexing and fast first paint.
- Keep login, account, create, editor, checkout, and order routes as SPA routes.
- Mark private and project-specific routes `noindex`.
- Parse and type route params at route boundaries.
- Put shareable filters, tabs, and meaningful navigation state in URL search
  params; keep temporary editor interaction state local.
- Do not add another router.

## RTK Query and backend state

Keep one base API using `fetchBaseQuery`. Modules add endpoints with
`api.injectEndpoints` when they are implemented.

RTK Query owns:

- authentication/session requests;
- project summaries and persisted project versions;
- templates and product configuration;
- pricing, checkout, orders, payment status, and delivery status;
- cache invalidation, retry state, and request status.

Do not copy RTK Query response data into ordinary Redux slices. Map backend DTOs
at the module boundary when the editor needs a domain document.

## Editor state and book core

The editor uses a serializable book document and typed commands. Representative
commands include:

- add, remove, and reorder spreads;
- place, move, crop, replace, or remove a photo;
- choose a layout, template, background, or cover option;
- add or edit text;
- apply an AI-generated batch of valid commands.

`core/book` validates and applies commands. Redux coordinates the current
document, committed history, undo/redo, save revision, and sync status. The
future AI layer calls the same command interface as the manual constructor.

Keep high-frequency pointer state outside Redux. During drag or resize, render
the transient preview locally and commit one final command on completion.

## Photo files and uploads

- Keep `File`, `Blob`, object URLs, image elements, and canvas instances outside
  Redux.
- Store serializable asset metadata and upload identifiers in state.
- Upload originals directly to object storage through backend-issued signed
  URLs; do not proxy large files through the frontend server.
- Support progress, cancellation, retry, duplicate detection, and recovery from
  expired signed URLs in the upload module.
- Revoke object URLs when they are no longer needed.

## Testing priorities

Highest-value automated coverage:

1. `core/book` invariants and command application.
2. Undo/redo and history compaction.
3. Serialization, migrations, and backend DTO mapping.
4. Layout and price calculations.
5. Upload recovery and save/sync behavior.
6. Critical flows: create project, edit, approve, checkout, and view order.

Use component tests for meaningful interaction and accessibility. Use browser
checks for layout, responsiveness, routing, and console failures. Add E2E tests
for critical cross-screen flows when those flows exist, not for every visual
change.
