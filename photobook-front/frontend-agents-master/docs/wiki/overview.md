---
type: overview
status: current
updated: 2026-07-21
sources:
  - AGENTS.md
  - agent-assets/frontend/skills/frontend-agent/SKILL.md
  - agent-assets/frontend/skills/frontend-error-ux/SKILL.md
tags:
  - photobook
  - agent-assets
---

# Photobook Frontend Agent Assets

## Purpose

This workspace contains project-local Codex instructions for building the
Photobook frontend. The active guidance matches the implemented React Router,
Redux Toolkit, and RTK Query architecture and the planned manual/AI-compatible
book command model.

## Active entry points

- `AGENTS.md`: maintenance rules for this source bundle.
- `agent-assets/frontend/skills/frontend-agent/SKILL.md`: main frontend skill.
- `agent-assets/frontend/skills/frontend-error-ux/SKILL.md`: recovery behavior.
- `agent-assets/react-19-frontend-agent/skills/react-19-patterns/SKILL.md`:
  generic React 19 component rules.
- `agent-assets/react-19-frontend-agent/skills/typescript-react-routing/SKILL.md`:
  project React Router rules.
- `agent-assets/frontend-design-plugin/skills/frontend-design/PROJECT_EXTENSION.md`:
  Photobook visual and UI governance direction.

Imported raw sources, Next.js material, the older React agent router, and the
template folder remain historical/reference assets. They are not part of the
active Photobook instruction chain.

## Project decisions

See [[modular-frontend-architecture]], [[frontend-architecture-guardrails]],
[[test-first-development-required]], and
[[frontend-error-ux-startup-required]].
