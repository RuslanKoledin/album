# Photobook Frontend Agent

## Purpose

`agent-assets/frontend/` contains the active project frontend instructions for
React 19, React Router Framework Mode, Redux Toolkit, RTK Query, modular
architecture, editor state, UI governance, design review, error recovery, and
verification.

## Entry points

- `skills/frontend-agent/SKILL.md`: main frontend workflow and stack rules.
- `skills/frontend-error-ux/SKILL.md`: Photobook failure and recovery states.
- `skills/photobook-design-review/SKILL.md`: composition, responsive UX,
  constructor design gates, accessibility, and browser visual QA.
- `skills/frontend-agent/references/frontend-architecture.md`: layer, state,
  routing, upload, and editor command architecture.
- `skills/frontend-agent/references/frontend-guardrails.md`: fixed decisions and
  excluded dependencies.
- `skills/frontend-agent/references/react-patterns.md`: project React patterns.

Imported Next.js and source-provenance references remain historical material.
They are not part of the active Photobook skill chain.

## Behavior

- Preserves the implemented project stack rather than suggesting TanStack or
  Next.js migrations.
- Keeps `shared` small and domain-agnostic.
- Uses the consuming project's `docs/engineering/frontend.md` as the single
  source for stack, architecture, code quality, testing, and Definition of Done.
- Keeps `core/book` pure and makes manual/AI editing share typed commands.
- Uses RTK Query for remote state, Redux Toolkit for durable editor state, and
  local React state for transient interaction.
- Applies risk-based testing and avoids low-value or duplicate coverage.
- Uses code-first implementation and browser verification by default. Figma is
  optional for explicit requests, stakeholder review, or unusually complex new
  flows and never blocks delivery.
- Preserves editor work through upload, autosave, offline, validation, render,
  checkout, and payment failures.

## Verification

- Run `quick_validate.py` for every changed skill folder.
- Search active skills/references for contradictory TanStack, Zustand, Next.js,
  Axios, or automatic UI-kit requirements.
- Verify the consuming Photobook frontend according to its risk-based
  Definition of Done and relevant browser checks.

## Related docs

- `docs/wiki/architecture/modular-frontend-architecture.md`
- `docs/wiki/decisions/frontend-architecture-guardrails.md`
- `docs/wiki/decisions/test-first-development-required.md`
- `docs/wiki/decisions/frontend-error-ux-startup-required.md`
