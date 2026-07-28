---
type: decision
status: current
updated: 2026-07-21
sources:
  - AGENTS.md
  - agent-assets/frontend/skills/frontend-error-ux/SKILL.md
tags:
  - photobook
  - frontend
  - error-ux
---

# Photobook Error and Recovery UX

## Decision

Maintain a designed 404 route, a root crash fallback, safe API error
normalization, and an accessible blocking dialog primitive. Add failure states
where their workflows are implemented rather than scaffolding every possible
modal during project initialization.

Offline connectivity must not automatically block the entire editor. Continue
safe local editing, show unsynced status, pause network-dependent actions, and
resume synchronization when possible. Upload, checkout, payment, or server
rendering may be blocked while offline.

## Priority scenarios

- upload retry and expired signed URLs;
- autosave failure without lost commands;
- expired sessions with recoverable work preserved;
- low-resolution and invalid-layout warnings tied to affected content;
- print render/export retry;
- checkout and payment recovery;
- explicit handling of conflicting local and server versions.

Raw backend text, stack traces, provider details, and technical status dumps
must never be shown to users.
