---
type: log
status: current
updated: 2026-07-21
sources: []
tags:
  - project-docs
  - wiki/log
---

# ai-tools Wiki Log

## [2026-05-28] bootstrap | Wiki initialized

- Created initial LLM Wiki structure in `docs/wiki`.

## [2026-05-28] update | Project documentation wiki skill configured

- Updated `project-documentation-wiki` in Codex skills and mirrored it to Claude/Agents skill folders.
- Added workspace rule in `AGENTS.md` requiring wiki checks at project task start and documentation updates after project-changing prompts.
- Created initial project wiki pages for this workspace.

## [2026-05-28] ingest | Notion modular architecture docs

- Read the Notion "Модульная архитектура" page, its linked Routing, Prettier, and ESLint pages, and the linked FigJam "Modular" board.
- Added [[notion-modular-architecture]] as the external source summary.
- Added [[modular-frontend-architecture]] as the durable architecture synthesis for future frontend/project structure work.

## [2026-05-28] update | Frontend architecture guardrails

- Updated [[modular-frontend-architecture]] with `shared` admission rules, dependency/public API boundaries, TanStack Router, TanStack Query, Zustand, single ESLint flat config, and measured `manualChunks` rules.
- Added [[frontend-architecture-guardrails]] as the decision record for these project-level frontend architecture rules.

## [2026-05-28] update | UI component sourcing rule

- Updated [[modular-frontend-architecture]] and [[frontend-architecture-guardrails]] to require project-owned or skill-provided UI components first.
- Documented shadcn/ui as the fallback component source when no suitable project/skill component exists.

## [2026-05-28] ingest | React patterns

- Preserved imported React pattern files under `docs/wiki/raw/react-patterns/`.
- Added [[react-patterns-source]] as the source summary for the imported React patterns and LobeHub layout/component conventions.
- Added [[react-patterns]] as the implementation-level React pattern guide and linked it from [[modular-frontend-architecture]] and [[frontend-architecture-guardrails]].

## [2026-05-28] ingest | Next.js skill files

- Preserved imported Next.js skill files and skill reports under `docs/wiki/raw/next-js/`.
- Added [[next-js-skill-sources]] as the source summary for Next.js App Router, Next.js 16 Launchpad, and Better Auth integration guidance.
- Added [[next-js-patterns]] as the framework-specific Next.js guidance page and linked it from [[modular-frontend-architecture]] and [[frontend-architecture-guardrails]].

## [2026-05-28] update | Frontend agent plugin

- Created the Codex-first `frontend` plugin with `.codex-plugin/plugin.json`, compatibility `.claude-plugin/plugin.json`, and `skills/frontend-agent/`.
- Bundled architecture, guardrail, React, Next.js, UI governance, audit, and source provenance references into the `frontend-agent` skill.
- Updated the existing `react-19-frontend-agent` to use the current TanStack Router, TanStack Query, Zustand, shadcn fallback, `shared`, and Next.js mode rules.
- Added local feature docs for `frontend/` and `react-19-frontend-agent/`.
- Added [[frontend-agent-plugin]] workflow documentation.

## [2026-05-28] update | Test-first development rule

- Added a workspace rule in `AGENTS.md` requiring test-first development for every new code-changing task.
- Documented [[test-first-development-required]] with the required order, frontend JS/TS testing rule, backend Python testing rule, E2E expectations, and explicit test case checklist requirement.
- Linked the rule from [[schema]] and [[index]] so future project startup reads surface it.

## [2026-05-28] update | Agent assets consolidated

- Created `agent-assets/` as the canonical folder for local skill/plugin packages, agent configs, and rule/reference files.
- Moved `frontend/`, `react-19-frontend-agent/`, and `frontend-design-plugin/` under `agent-assets/`.
- Kept root `AGENTS.md` in place for Codex project-rule discovery and updated its local frontend-design mirror paths.
- Added `tools/verify-agent-assets.ps1` to validate the consolidated structure and counts for skills, agents, and reference/rule files.
- Added [[agent-assets-consolidation]] and updated [[frontend-agent-plugin]], [[overview]], [[index]], and local feature docs to the new paths.

## [2026-05-28] update | Frontend project bootstrap

- Added `agent-assets/project-documentation-wiki/` so documentation wiki startup is bundled with the project-local agent assets.
- Added `tools/install-agent-assets.ps1` to install local skills, agents, `AGENTS.md`, `docs/wiki/`, and `docs/frontend/` into target frontend projects.
- Added `tools/test-install-agent-assets.ps1` to verify the installer against a temporary target project.
- Updated `AGENTS.md`, `frontend-agent`, and `react-19-frontend-agent` so frontend work starts through the project-local documentation wiki, frontend router skill, React sub-skills, and frontend-design governance.
- Added [[frontend-project-bootstrap]] and updated [[agent-assets-consolidation]], [[frontend-agent-plugin]], [[overview]], and [[index]].

## [2026-05-28] update | Frontend error UX startup audit

- Added the bundled `frontend-error-ux` skill under `agent-assets/frontend/skills/`.
- Updated frontend project initialization to immediately audit for a 404 page, blocking error modal/dialog, crash fallback, and offline no-internet screen blocker.
- Updated installer verification, frontend audit docs, feature docs, and [[frontend-error-ux-startup-required]].

## [2026-05-29] update | Codex global skill install verified

- Installed or refreshed project-created skills into `C:\Users\User\.codex\skills`: `project-documentation-wiki`, `frontend-agent`, `frontend-error-ux`, `frontend-design`, `react-19-frontend-agent`, `react-19-patterns`, `typescript-react-routing`, and `nextjs-app-router-practices`.
- Verified all eight installed `SKILL.md` files with `quick_validate.py` using UTF-8 mode.
- Confirmed `agent-assets/` still validates with 8 skills, 7 agent metadata files, and 22 reference/rule files.

## [2026-05-29] update | Template Project starter

- Created `Template Project/` as a ready-to-copy frontend project starter with local `agent-assets/`, `AGENTS.md`, `AgentMD.md`, `docs/wiki/`, and `docs/frontend/`.
- Added `tools/test-template-project.ps1` to verify template structure, skill paths, agent metadata counts, and startup-rule coverage.
- Added `Template Project/FEATURE.md` and [[template-project]] to document the template as a durable project artifact.
- Updated [[frontend-project-bootstrap]] and [[index]] to include the template workflow.

## [2026-05-29] update | Repository publication

- Created the private GitHub repository `AzamatRaimbekov/frontend-agents`.
- Added `origin` pointing to `https://github.com/AzamatRaimbekov/frontend-agents.git`.
- Published `master` with the initial project commit.
- Could not create the GitLab repository because no GitLab CLI, token, credential helper entry, `.config` entry, or `.netrc` credential is available locally.
- Added [[repository-publication]] to track remote publication status.

## [2026-07-21] update | Adapted agent assets for Photobook

- Replaced active TanStack Router, TanStack Query, and Zustand defaults with the
  implemented React Router Framework Mode, Redux Toolkit, and RTK Query stack.
- Added Photobook editor state rules, pure `core/book` boundaries, serializable
  file handling, and a shared manual/AI command model.
- Changed mandatory full offline blocking into recoverable local editing with
  paused network actions and explicit synchronization status.
- Replaced universal full TDD/E2E requirements with strong domain test-first
  rules and proportional UI verification.
- Adapted the design extension to a calm premium editorial direction for
  mobile-first photo workflows in Kyrgyzstan.
- Added a project-root `AGENTS.md` so the adapted rules are active for future
  work in `photobook-front`.
- Updated and validated the Codex plugin manifests as version `0.2.0` with
  Photobook-specific metadata and starter prompts.
- Marked the duplicated `Template Project/` as an archived snapshot and updated
  its verification script so it cannot be mistaken for the active bundle.
- Excluded agent Markdown from Tailwind source detection to prevent instruction
  examples from increasing production CSS.

## [2026-07-21] update | Added Photobook design review workflow

- Added the `photobook-design-review` skill to the active frontend plugin.
- Defined proportional Figma composition, complete UI-state planning,
  accessibility, responsive review, and browser screenshot comparison.
- Added constructor-specific gates for selection, canvas hierarchy, crop,
  print warnings, save state, and narrow-screen editing.
- Connected the skill to project startup, installer verification, frontend UI
  memory, plugin metadata, and the active frontend workflow.

## [2026-07-21] update | Enforced Photobook code organization

- Added the consuming project's then-current handbook to every frontend task
  startup; it was later consolidated into a single engineering rules file.
- Required public barrel imports, banned parent-relative and module deep
  imports, and documented component/hook/libs/model responsibilities.
- Added enforced file budgets, `react-icons` for standard icons, shared
  iconpack rules for custom icons, and `pnpm architecture:check` verification.

## [2026-07-21] update | Adopted risk-based testing and optional Figma

- Restricted test-first development to high-risk book invariants, commands,
  undo/redo, print or pricing calculations, non-trivial persistence/contracts,
  and bug fixes.
- Removed the default expectation of tests for static UI, styles, barrels,
  simple configuration, endpoint wiring, and framework adapters.
- Made code-first browser iteration the default design workflow; Figma is now
  optional for explicit requests, stakeholder review, or unusually complex
  flows and never blocks delivery.

## [2026-07-21] update | Consolidated Photobook project documentation

- Replaced four consuming-project rule files with one authoritative
  `docs/engineering/frontend.md` document and a `docs/README.md` index.
- Reduced project `AGENTS.md`, `README.md`, and the frontend skill to navigation
  and procedural responsibilities instead of duplicated engineering rules.
- Separated planning, engineering, and executable API contract documentation by
  ownership and updated the active workflow to the new paths.
