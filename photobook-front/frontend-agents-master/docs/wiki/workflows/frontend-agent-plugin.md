---
type: workflow
status: current
updated: 2026-07-21
sources:
  - agent-assets/frontend/FEATURE.md
  - agent-assets/frontend/skills/frontend-agent/SKILL.md
  - agent-assets/frontend/skills/frontend-error-ux/SKILL.md
  - agent-assets/frontend/skills/photobook-design-review/SKILL.md
tags:
  - photobook
  - frontend
  - agent
---

# Photobook Frontend Agent Workflow

## Active chain

1. Read the consuming project's `AGENTS.md`, then its documentation index and
   single frontend engineering rules file.
2. Use `agent-assets/frontend/skills/frontend-agent/SKILL.md` for architecture,
   state, routing, UI, API, and verification decisions.
3. Load only the relevant direct reference.
4. Use `frontend-error-ux` for failure/recovery work.
5. Use the React 19 pattern or React Router sub-skill when the task needs it.
6. For UI work, use `photobook-design-review`; it applies the Photobook project
   extension, defaults to code-first browser iteration, and owns constructor
   quality gates and accessibility. Figma is optional, never a gate.

## Stack policy

The active chain preserves React Router Framework Mode, Redux Toolkit, RTK
Query, Tailwind, and the independent `core/book` layer. Generic TanStack,
Zustand, shadcn, and Next.js recommendations are not active defaults.

## Documentation policy

The consuming project owns durable rules in one frontend engineering document;
its `AGENTS.md`, `README.md`, skills, roadmap, and backlog link to that source
instead of repeating it. Update the Wiki or UI memory for durable architecture,
schema, API, reusable component/token, route, or significant user-flow changes.

## Verification

Validate changed skill folders with the system `quick_validate.py`, search
active files for conflicting stack rules, and run the consuming frontend's
`pnpm architecture:check` plus risk-targeted tests, type, lint, build, and
relevant browser checks.
