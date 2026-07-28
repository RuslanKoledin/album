# Frontend Documentation

This folder is the project memory for frontend work. The agent must read and update it whenever
frontend UI, layout, styling, components, pages, or visual behavior changes.

## Files

- `design-system.md`: colors, typography, spacing, radius, shadows, motion, breakpoints, accessibility.
- `components.md`: reusable UI component inventory and reuse rules.
- `screens.md`: screens, routes, major layouts, and page-level UI ownership.
- `ui-decisions.md`: dated UI and design-system decisions.
- `audit-checklist.md`: completion checklist for frontend changes, including 404, error modal, crash fallback, and offline no-internet blocker checks.

## Required Agent Workflow

Before UI work:

1. Read this folder.
2. Inspect existing UI code and styles.
3. Prefer documented tokens and components.
4. Identify documentation updates that the change will require.

After UI work:

1. Update the relevant docs in this folder.
2. Verify desktop and mobile layout when practical.
3. Fix visual issues before final response.

## Current Project UI Surface

The current repository contains a frontend-design demonstration page:

- `frontend-design-demo.html`
- `frontend-design-demo-preview-desktop.png`
- `frontend-design-demo-preview.png`

Future application UI should be documented here as it is added.
