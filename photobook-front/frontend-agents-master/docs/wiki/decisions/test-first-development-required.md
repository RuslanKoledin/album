---
type: decision
status: current
updated: 2026-07-21
sources:
  - AGENTS.md
tags:
  - photobook
  - testing
---

# Risk-Based Test-First Development

## Decision

Write a failing focused test first for high-risk domain invariants, book
commands, undo/redo, print or pricing calculations, non-trivial
serialization/migrations or API mappings, and bug fixes. Test reducers only
when they contain meaningful transitions. Then implement the smallest change
and run tests targeted at the changed risk.

Do not add tests by default for presentational components, static pages, styles
or tokens, barrels, simple configuration, straightforward endpoint wiring, or
framework adapters. Component tests protect meaningful behavior or
accessibility that is cheaper to verify there than in a pure test or browser.
Avoid repeating the same contract at UI, RTK Query, MSW, and OpenAPI layers
without a distinct risk. Browser verification is primary for responsive and
visual-only changes. E2E coverage is reserved for completed critical journeys.

## Rationale

The editor domain and backend contract require strong executable
specifications, while broad routine coverage slows MVP delivery and increases
maintenance without proportional risk reduction.

## Minimum verification

- Targeted tests only for changed high-value risks.
- Typecheck and lint.
- Relevant broader tests and production build.
- Browser checks for UI routes and states when practical.
