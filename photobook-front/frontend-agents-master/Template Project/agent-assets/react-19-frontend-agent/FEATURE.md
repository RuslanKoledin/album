# React 19 Frontend Agent

## Purpose

`agent-assets/react-19-frontend-agent/` is the earlier local frontend agent plugin. It now mirrors the newer project frontend architecture guardrails so existing references to this agent continue to use the same standards as the new `agent-assets/frontend` plugin.

## Entry Points

- `.claude-plugin/plugin.json`: plugin metadata.
- `skills/react-19-frontend-agent/SKILL.md`: main agent router skill.
- `skills/react-19-frontend-agent/references/`: project architecture and governance references.
- Sub-skills:
  - `skills/react-19-patterns/`
  - `skills/typescript-react-routing/`
  - `skills/nextjs-app-router-practices/`

## Behavior

- Inside target projects, this agent is part of the project-local
  `agent-assets/` bundle installed by `tools\install-agent-assets.ps1`.
- It should be invoked after project wiki startup and general frontend routing
  through `agent-assets/frontend/skills/frontend-agent/SKILL.md`.
- It now defers frontend initialization error-surface checks to
  `agent-assets/frontend/skills/frontend-error-ux/SKILL.md` for 404 pages,
  blocking error modals/dialogs, crash fallbacks, and offline no-internet
  blockers.
- Uses React 19, TypeScript, modular architecture, and small component files.
- Defaults new SPA routing to TanStack Router when the repo is not already bound to another router.
- Uses TanStack Query for client-side server state and keeps Zustand limited to small client-only stores.
- Uses project-owned or active skill-provided UI components first, with shadcn as fallback.
- Treats Next.js App Router as a framework-specific mode, not as the default for every frontend.

## Verification

- Validate changed skills with `quick_validate.py`.
- Validate the consolidated folder with `powershell -NoProfile -ExecutionPolicy Bypass -File tools\verify-agent-assets.ps1`.
- Verify UI work through browser inspection when practical.

## Wiki Links

- `docs/wiki/workflows/frontend-agent-plugin.md`
- `docs/wiki/architecture/modular-frontend-architecture.md`
- `docs/wiki/decisions/frontend-architecture-guardrails.md`
- `docs/wiki/decisions/frontend-error-ux-startup-required.md`

## Open Questions

- This older agent still uses a `.claude-plugin` manifest. The new `frontend` plugin is the Codex-first package.
