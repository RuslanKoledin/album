# UI Decisions

Record meaningful frontend and design-system decisions here.

## 2026-05-26: Add Frontend UI Governance

Decision:

- Keep the official Anthropic `frontend-design` skill as the visual-quality base.
- Add project-specific UI governance through `agent-assets/frontend-design-plugin/skills/frontend-design/PROJECT_EXTENSION.md`.
- Maintain `docs/frontend/` as the project memory for components, colors, typography, spacing, screens, and UI decisions.

Rationale:

- The project needs frontend work to be consistent across future tasks.
- The agent should not invent colors, components, fonts, or layout rules without recording them.
- Documentation must evolve with the UI code so future frontend work has context.

## 2026-05-26: Document Demo Visual System

Decision:

- Record the current demo palette, typography, spacing, components, and responsive rules as the initial frontend documentation.

Rationale:

- The current repository contains a frontend-design demo page.
- Capturing it creates a baseline for future UI expansion.

## 2026-05-28: Adopt Frontend Architecture Guardrails

Decision:

- Treat `docs/wiki/architecture/modular-frontend-architecture.md` and `docs/wiki/decisions/frontend-architecture-guardrails.md` as the frontend architecture standard for new app work.
- Use TanStack Router and TanStack Query for new routing and server-state work.
- Use Zustand only for small cross-screen client-only state that does not belong in local state, URL state, or server-state cache.
- Use project-owned or active skill-provided UI components first; use shadcn/ui as the fallback when no suitable project component exists.
- Use `docs/wiki/concepts/react-patterns.md` as the React implementation guide for component design, hooks, state placement, performance, errors, TypeScript, and testing.
- Use `docs/wiki/concepts/next-js-patterns.md` when a project is explicitly Next.js.

Rationale:

- UI consistency depends on module boundaries as much as visual tokens.
- The project needs explicit rules that keep `shared` clean, prevent deep cross-module imports, and avoid competing frontend infrastructure choices.
- Component consistency depends on reusing the project UI kit before introducing new external primitives.
- React patterns make the architecture operational by describing how components, hooks, state, and tests should be shaped inside each module.
- Next.js projects need framework-specific route, server/client component, caching, metadata, and auth-boundary guidance without weakening the generic SPA architecture rules.

## 2026-05-28: Require Error UX Startup Audit

Decision:

- Bundle `frontend-error-ux` with the local frontend plugin.
- Run it immediately during frontend project initialization.
- Require each initialized frontend app to verify a custom 404 page, blocking error modal/dialog, crash fallback, and offline screen-blocking overlay that says there is no internet connection.

Rationale:

- These are app-level recovery surfaces and should exist before new routes and network-dependent features are added.
- Offline loss should be visible and blocking for network-dependent workflows, not a hidden fetch failure or blank state.
