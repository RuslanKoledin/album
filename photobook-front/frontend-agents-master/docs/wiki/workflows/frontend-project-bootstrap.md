---
type: workflow
status: current
updated: 2026-07-21
sources:
  - AGENTS.md
  - tools/install-agent-assets.ps1
  - agent-assets/frontend/skills/frontend-agent/SKILL.md
tags:
  - photobook
  - frontend
  - bootstrap
---

# Photobook Frontend Agent Bootstrap

## Current project

`photobook-front/AGENTS.md` activates the canonical skills directly from
`frontend-agents-master/agent-assets/`. No global plugin installation or copied
skill tree is required for the current workspace.

The agent source folder is excluded from Prettier and Tailwind scanning so its
Markdown examples do not affect application checks or generated CSS.

## Reuse in another project

When PowerShell is available, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\install-agent-assets.ps1 -TargetProject <project-path>
```

The installer copies canonical assets, initializes starter documentation, and
writes a managed project-local `AGENTS.md` block with the Photobook stack and
proportional workflow rules.

`Template Project/` is an archived original snapshot and must not be copied.

## Verification

- `quick_validate.py` validates active skills.
- `validate_plugin.py` validates Codex plugin manifests.
- `test-install-agent-assets.ps1` verifies installer output where PowerShell is
  available.
- The consuming frontend runs format, typecheck, lint, tests, and build.
