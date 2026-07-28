---
name: frontend-agent
description: Use when creating, editing, reviewing, planning, or refactoring frontend applications, React/Next.js apps, routes, modules, UI components, dashboards, pages, design-system docs, state/data flows, authentication boundaries, or frontend architecture. Applies to React 19, TypeScript, Vite/SPAs, Next.js App Router, TanStack Router, TanStack Query, Zustand, shadcn fallback components, project UI governance, and modular/FSD-like frontend structure.
---

# Frontend Agent

## Purpose

Act as the project frontend specialist. Build and review production frontends using the local architecture standard, UI governance memory, React/Next.js patterns, and project component sourcing rules.

## Required Startup

For any real project task:

1. Confirm the project has local `agent-assets/`. If this is a new/onboarded frontend project and the source `ai-tools` workspace is available, install the bundle with `powershell -NoProfile -ExecutionPolicy Bypass -File tools\install-agent-assets.ps1 -TargetProject <project-path>` from the source workspace before doing product work.
2. Read `agent-assets/project-documentation-wiki/SKILL.md`, run `python agent-assets/project-documentation-wiki/scripts/init_project_wiki.py --project .`, then read `docs/wiki/index.md`, `docs/wiki/schema.md`, recent `docs/wiki/log.md`, and relevant feature docs.
3. Read `agent-assets/frontend/skills/frontend-error-ux/SKILL.md` and immediately run its startup audit for a 404 page, error modal, crash fallback, and offline screen-blocking overlay.
4. For UI work, read `agent-assets/frontend-design-plugin/skills/frontend-design/SKILL.md`, `agent-assets/frontend-design-plugin/skills/frontend-design/PROJECT_EXTENSION.md`, and `docs/frontend/README.md`, `design-system.md`, `components.md`, `screens.md`, `ui-decisions.md`, and `audit-checklist.md`.
5. Inspect the existing stack before choosing tools: `package.json`, router files, app entry, `tsconfig`, lint/format config, existing UI components, and docs.
6. Prefer the existing project stack unless the user explicitly asks for a new app or migration.

## Reference Map

Load only the references needed for the task:

- `references/frontend-architecture.md`: modular architecture, shared rules, dependency boundaries, routing/data/state, Next.js mode, linting, bundle splitting.
- `references/frontend-guardrails.md`: decision record for required architecture choices.
- `references/react-patterns.md`: component, hook, state, composition, performance, error boundary, TypeScript, and testing patterns.
- `references/next-js-patterns.md`: Next.js App Router, Server/Client Components, Cache Components, Better Auth, metadata, fonts, and verification.
- `references/ui-components-governance.md`: project component inventory and component source priority.
- `references/ui-design-system-governance.md`: tokens, typography, spacing, motion, breakpoints, accessibility.
- `references/ui-screens-governance.md`: screen and layout documentation rules.
- `references/frontend-audit-checklist.md`: completion checklist for UI work.
- `references/source-*.md`: provenance summaries for imported Notion, React, and Next.js source files.
- `../frontend-error-ux/SKILL.md`: startup and implementation rules for 404 pages, error modals, crash fallbacks, and offline blockers.

## Project-Local Skill Chain

- Use `agent-assets/project-documentation-wiki/SKILL.md` first for project memory startup and documentation updates.
- Use this `frontend-agent` skill as the router for frontend architecture, stack, UI governance, and verification.
- Use `agent-assets/frontend/skills/frontend-error-ux/SKILL.md` immediately during frontend project initialization to check or create the 404 page, error modal, and offline screen blocker.
- Use `agent-assets/react-19-frontend-agent/skills/react-19-frontend-agent/SKILL.md` for React 19-specific implementation and its sub-skills for routing, React patterns, and Next.js App Router.
- Use `agent-assets/frontend-design-plugin/skills/frontend-design/PROJECT_EXTENSION.md` for UI memory and design-system control.
- Keep any new project-specific skills, agents, or rules under the current project's `agent-assets/` folder.

## Stack Rules

- Generic React/Vite/SPAs: use TanStack Router by default for new routing work.
- Next.js projects: use Next.js App Router conventions; treat Next.js as framework-specific mode, not the default for every frontend.
- Server state: use TanStack Query for client-side server state, mutations, invalidation, optimistic updates, loading, and error status.
- URL-addressable state: use TanStack Router search params for SPAs and framework-appropriate URL/search state in Next.js.
- Client-only shared state: use small Zustand stores at most. Do not introduce Redux, MobX, or heavier state managers without a new architecture decision.
- Local state: prefer `useState`, `useReducer`, derived values, and component decomposition before global stores.

## Architecture Rules

- Keep `app`, `modules`, `routes/pages`, `shared`, and `@types` boundaries clear.
- `shared` is only for domain-agnostic primitives, infrastructure, design-system UI, generic utilities, generic hooks, generic types, and app-wide integration helpers.
- Domain API calls, query keys, mutations, schemas, DTO mapping, business rules, stores, feature hooks, forms, filters, and workflow state stay inside the owning module.
- `shared` must not import from `app`, `routes`, `pages`, or `modules`.
- Modules should not depend on other modules by default. If unavoidable, import only from the other module public `index.ts` and document the dependency.
- No deep imports across module boundaries.

## Component And UI Rules

- Use project-owned components first: documented components, components already in the codebase, and components provided by an active project UI/design skill.
- If an active UI skill defines component priority, follow it before external sources.
- If no suitable project or skill component exists, use shadcn/ui as the fallback and follow the shadcn workflow: check installed components, read docs, respect aliases, use variants/composition, and document additions.
- Custom generic UI markup is the last resort unless the task explicitly requires bespoke UI.
- New reusable UI components must be added to frontend component docs.
- New colors, fonts, spacing, radii, shadows, motion, or breakpoints must be added to frontend design-system docs.
- New routes/screens/layouts must be added to frontend screen docs.

## React Implementation Rules

- Keep components small, focused, typed, and composable.
- Keep presentational components prop-driven; route/container components own data loading, mutation wiring, and workflow orchestration.
- Extract custom hooks when logic repeats, becomes noisy, or deserves a domain name.
- Keep render pure. Do not perform side effects, subscriptions, random/date generation, DOM writes, or async work directly in render.
- Use error boundaries at app, route/feature, and risky component levels.
- Use the error UX startup audit to keep 404, modal, crash fallback, and offline no-internet blocker behavior present in every initialized frontend project.
- Optimize only after profiling or a clear visible slowdown.

## Next.js Mode

Use `references/next-js-patterns.md` when the project is explicitly Next.js.

- App Router pages live under `app/[route]/page.tsx`; layouts live at root or nested route layout files.
- Server Components are default. Use `"use client"` only for hooks, effects, events, browser APIs, or client-only libraries.
- Server Components may fetch directly when data remains server-rendered.
- Use TanStack Query for client-side server state and interactive mutation/cache workflows.
- For Next.js 16/version-specific behavior such as Cache Components, async request APIs, or `proxy.ts`, verify against current official Next.js docs before changing a live app.
- Better Auth work must include secure sessions/JWT, protected routes, server/client session access, secure cookies, CSRF, validation, rate limiting, secrets, and auth-flow tests.

## Workflow

1. Inspect existing architecture, docs, dependencies, and route/component layout.
2. Choose framework mode: SPA/TanStack Router or Next.js App Router.
3. Define route/module ownership before writing components.
4. Place data, state, and API concerns at the narrowest valid boundary.
5. Reuse documented UI/components/tokens first; use shadcn only as fallback.
6. Implement in small typed files with stable public APIs.
7. Update wiki, frontend docs, and nearby `FEATURE.md` files for durable behavior/architecture/UI changes.
8. Verify with typecheck/lint/tests and browser inspection for UI work when practical.

## Completion Checklist

- Architecture boundaries are preserved.
- Error UX startup audit has checked 404, error modal, crash fallback, and offline blocker behavior.
- `shared` did not receive module-owned business logic.
- Router, server state, URL state, and client-only state follow the project standards.
- Components are typed, focused, and split before they become broad.
- Project UI docs are updated for UI/component/design-system/screen changes.
- Next.js-specific guidance was applied only to explicit Next.js projects.
- Verification was run or the limitation is stated clearly.
