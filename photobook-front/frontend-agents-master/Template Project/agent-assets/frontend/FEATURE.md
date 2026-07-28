# Frontend Plugin

## Purpose

`agent-assets/frontend/` is a local Codex plugin that packages the project frontend agent and its references. It lets future Codex sessions use one `frontend-agent` skill for modular React, Next.js, UI governance, TanStack Router, TanStack Query, Zustand, shadcn fallback components, and verification workflows.

## Entry Points

- `.codex-plugin/plugin.json`: Codex plugin manifest.
- `.claude-plugin/plugin.json`: lightweight compatibility manifest for Claude-style plugin mirrors.
- `skills/frontend-agent/SKILL.md`: main frontend agent instructions.
- `skills/frontend-error-ux/SKILL.md`: startup and implementation rules for 404 pages, error modals, crash fallbacks, and offline no-internet blockers.
- `skills/frontend-agent/references/`: bundled project architecture, guardrails, React patterns, Next.js patterns, and frontend governance references.

## Behavior

- New or onboarded frontend projects should receive this plugin through
  `tools\install-agent-assets.ps1 -TargetProject <project-path>` from the
  source `ai-tools` workspace.
- Inside a target project, this skill should start with the project-local
  `agent-assets/project-documentation-wiki/SKILL.md` and then route frontend
  work through the local `agent-assets/frontend/skills/frontend-agent/SKILL.md`.
- The skill starts by reading project wiki/frontend docs and inspecting the existing stack.
- Frontend initialization immediately runs `frontend-error-ux` to check for a
  404 page, blocking error modal/dialog pattern, crash fallback, and offline
  screen-blocking overlay that shows a no-internet message.
- For generic React SPAs, it defaults new routing to TanStack Router.
- For explicit Next.js projects, it uses App Router conventions.
- TanStack Query is the default client-side server-state layer.
- Zustand is the maximum global client-state manager and is limited to small client-only stores.
- Project-owned or active skill-provided UI components are preferred before shadcn; shadcn is the fallback.
- Durable frontend changes require wiki/frontend docs and feature docs to stay current.

## Dependencies

- Project wiki under `docs/wiki/`.
- Frontend governance docs under `docs/frontend/`.
- Project-local documentation wiki skill under `agent-assets/project-documentation-wiki/`.
- The local shadcn skill/plugin when shadcn components are needed.
- Browser verification tooling when UI work needs rendered inspection.

## Verification

- Validate the skills with `python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py agent-assets\frontend\skills\frontend-agent` and `python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py agent-assets\frontend\skills\frontend-error-ux`.
- Validate the plugin with `python C:\Users\User\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py agent-assets\frontend`.
- Validate the consolidated folder with `powershell -NoProfile -ExecutionPolicy Bypass -File tools\verify-agent-assets.ps1`.

## Wiki Links

- `docs/wiki/workflows/frontend-agent-plugin.md`
- `docs/wiki/architecture/modular-frontend-architecture.md`
- `docs/wiki/decisions/frontend-architecture-guardrails.md`

## Open Questions

- Whether to add this plugin to a personal or repo marketplace is left to the user; the current task created the plugin files but did not install/register a marketplace entry.
