---
type: workflow
status: current
updated: 2026-05-28
sources:
  - ../../AGENTS.md
  - ../../agent-assets/README.md
  - ../../agent-assets/FEATURE.md
  - ../../tools/install-agent-assets.ps1
  - ../../tools/test-install-agent-assets.ps1
  - ../../tools/verify-agent-assets.ps1
tags:
  - project-docs
  - wiki/workflow
  - agents
  - skills
---

# Agent Assets Consolidation

## Purpose

Local skill/plugin packages are now consolidated under `agent-assets/` so the
repository has one obvious home for skills, agent configs, and rule/reference
resources.

## Canonical Structure

- `agent-assets/frontend/`: Codex-first frontend plugin with `frontend-agent`
  and `frontend-error-ux` skills.
- `agent-assets/project-documentation-wiki/`: documentation wiki skill,
  OpenAI agent metadata, init script, and LLM wiki reference.
- `agent-assets/react-19-frontend-agent/`: earlier React 19 agent plugin and
  React/routing/Next.js sub-skills.
- `agent-assets/frontend-design-plugin/`: local mirror of the frontend-design
  skill and project extension rules.
- `AGENTS.md`: remains at the repository root because Codex discovers
  project-level rules there.

## Maintenance Rules

- Add new local agent plugins under `agent-assets/`.
- Keep each package's `SKILL.md`, `agents/`, and `references/` resources
  together.
- Use `tools/install-agent-assets.ps1 -TargetProject <project-path>` to install
  the complete local bundle into another project before starting frontend work
  there.
- Update `agent-assets/FEATURE.md`, affected package `FEATURE.md` files, and
  wiki links when paths change.
- Run `tools/verify-agent-assets.ps1` after moving or adding local agent assets.
- Run `tools/test-install-agent-assets.ps1` after changing bootstrap behavior.

## Target Project Bootstrap

The installer copies `agent-assets/`, creates or updates a managed block in the
target `AGENTS.md`, initializes `docs/wiki/` through the project-local
documentation skill, and copies starter `docs/frontend/` governance files
without overwriting existing frontend docs.

The managed target-project rules make Codex start frontend work through this
chain:

1. `agent-assets/project-documentation-wiki/SKILL.md`
2. `agent-assets/frontend/skills/frontend-agent/SKILL.md`
3. `agent-assets/frontend/skills/frontend-error-ux/SKILL.md`
4. `agent-assets/react-19-frontend-agent/skills/react-19-frontend-agent/SKILL.md`
   and sub-skills when React/routing/Next.js details are involved
5. `agent-assets/frontend-design-plugin/skills/frontend-design/SKILL.md` and
   `PROJECT_EXTENSION.md` for UI/design-system governance

## Verification

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\verify-agent-assets.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\test-install-agent-assets.ps1
```

The checks confirm expected packages, parseable plugin manifests, absent old
root plugin folders, minimum counts for skill, agent, and reference/rule files,
and a working install into a temporary target project.
