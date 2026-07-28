---
name: typescript-react-routing
description: Add, change, review, or test typed React Router Framework Mode routes in the Photobook frontend, including route modules, layouts, params, search state, metadata, prerendered public pages, private SPA routes, navigation, and route error behavior.
---

# TypeScript React Routing for Photobook

Use the existing React Router Framework Mode setup. Do not introduce TanStack
Router, Next.js routing, or a parallel route registry.

## Route ownership

- Define route structure in `src/app/routes.ts`.
- Keep route modules in `src/app/routes/` and page composition in `src/pages/`.
- Keep route modules small: parse params, declare metadata, connect loaders or
  actions when needed, and render the page.
- Put business workflows in modules rather than route files.
- Use generated React Router route types instead of hand-casting params.

## Public and private behavior

- Prerender only stable public SEO routes declared in
  `react-router.config.ts`, initially `/`, `/books`, and `/help`.
- Keep login, account, project creation, editor, checkout, and order routes as
  SPA routes.
- Add `noindex, nofollow` metadata to private or project-specific pages.
- Every new user-facing page must be registered and reachable, unless it is an
  intentionally deep-linked state documented in the task.
- Preserve the catch-all Not Found route and root error boundary.

## URL state

- Use path params for resource identity.
- Use search params for shareable filters, tabs, sorting, or editor navigation
  that should survive reload and browser history.
- Keep pointer state, temporary dialogs, and drag previews out of the URL.
- Parse untrusted URL values once at the route or module boundary and handle
  invalid values with safe navigation or a user-facing state.

## Verification

1. Update route configuration and navigation together.
2. Add a focused test when route behavior, params, access, or metadata matter.
3. Run type generation and TypeScript checks.
4. Smoke-test direct navigation, client navigation, refresh, unknown routes,
   and relevant private metadata.
5. Confirm new public routes are added to prerender only when SEO value exists.
