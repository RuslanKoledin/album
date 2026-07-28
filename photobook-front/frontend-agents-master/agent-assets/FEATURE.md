# Photobook Agent Assets

## Purpose

Provide durable local instructions for the Photobook React frontend without
changing its selected stack or overloading MVP work with generic governance.

## Active behavior

- `frontend-agent` owns project architecture and workflow decisions.
- `frontend-error-ux` owns upload, autosave, offline, render, checkout, and
  payment recovery guidance.
- `photobook-design-review` owns UI composition, constructor quality gates,
  accessibility, responsive behavior, and browser-based visual QA.
- `react-19-patterns` supplies generic component guidance.
- `typescript-react-routing` supplies project React Router guidance.
- the design `PROJECT_EXTENSION.md` overrides generic visual tone.

The older React agent is a compatibility delegate. Next.js and imported source
materials are not active for Photobook.

## Verification

- Validate changed skills with `quick_validate.py`.
- Validate both Codex plugin manifests with `validate_plugin.py`.
- Search the active chain for contradictory stack defaults.
- Run consuming-project checks after integration changes.
