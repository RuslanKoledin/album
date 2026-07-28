---
type: index
status: current
updated: 2026-07-21
sources: []
tags:
  - project-docs
  - wiki/index
---

# ai-tools Wiki Index

## Start Here

- [[overview]] - High-level project overview.
- [[schema]] - Wiki conventions and maintenance rules.
- [[project-documentation-wiki-required]] - Decision for durable project memory.
- [[test-first-development-required]] - Risk-based tests for domain behavior and bugs.
- [[frontend-error-ux-startup-required]] - Photobook failure, offline, and recovery behavior.

## Architecture

- [[modular-frontend-architecture]] - React Router, Redux/RTK Query, editor, and `core/book` architecture.

## Workflows

- [[agent-assets-consolidation]] - Canonical folder for local skills, agents, and rule/reference resources.
- [[frontend-agent-plugin]] - Active frontend, code-organization, recovery, and
  design-review skill chain.
- [[frontend-project-bootstrap]] - Installing project-local skills, agents, wiki startup, and frontend governance into new frontend projects.
- [[project-documentation-wiki-skill]] - How the living documentation skill is configured and used.
- [[repository-publication]] - Remote repository publication status for GitHub and GitLab.
- [[template-project]] - Archived pre-Photobook template; retained only for provenance.

## Concepts

- [[next-js-patterns]] - Historical imported Next.js guidance; not active for Photobook.
- [[react-patterns]] - Component, hook, state, composition, performance, error, TypeScript, and testing patterns for React work.

## Entities

## Decisions

- [[frontend-architecture-guardrails]] - Fixed React Router, Redux Toolkit, RTK Query, and editor boundaries.
- [[frontend-error-ux-startup-required]] - Preserve work across upload, autosave, offline, render, and checkout failures.
- [[project-documentation-wiki-required]] - Keep documentation checks tied to project work.
- [[test-first-development-required]] - Strong tests for high-risk logic without routine UI/wiring coverage.

## Sources

- [[project-documentation-wiki-skill]] - Summary of the skill configuration and files.
- [[notion-modular-architecture]] - Source summary for the external Notion modular architecture docs and linked FigJam diagram.
- [[next-js-skill-sources]] - Source summary for imported Next.js App Router, Next.js 16, and Better Auth skill files.
- [[react-patterns-source]] - Source summary for imported React patterns and LobeHub layout/component conventions.

## Synthesis

## Local Feature Docs

- `agent-assets/FEATURE.md` - Consolidated local skills, agents, and rule/reference resources.
- `agent-assets/frontend/FEATURE.md` - Codex-first frontend plugin with `frontend-agent` and `frontend-error-ux` skills.
- `agent-assets/react-19-frontend-agent/FEATURE.md` - Existing React 19 frontend agent updated to the current guardrails.
- `Template Project/FEATURE.md` - Archived original template snapshot.
