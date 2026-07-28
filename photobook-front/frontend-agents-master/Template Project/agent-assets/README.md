# Agent Assets

This folder is the canonical home for local agent-facing assets in this
workspace: skills, agent prompts/configuration, and rule/reference files.

## Contents

- `project-documentation-wiki/`: local copy of the documentation wiki skill,
  its OpenAI agent metadata, wiki init script, and LLM wiki reference.
- `frontend/`: Codex-first frontend plugin with the `frontend-agent` and
  `frontend-error-ux` skills, OpenAI agent configs, and bundled architecture/UI
  governance references.
- `react-19-frontend-agent/`: earlier React 19 frontend agent plugin with
  React, routing, and Next.js sub-skills.
- `frontend-design-plugin/`: local mirror of the frontend design skill and its
  project extension rules.

## Maintenance

- Keep skill folders, `agents/`, and `references/` together inside the same
  plugin package.
- Add new local agent plugins under this folder instead of creating new
  top-level plugin folders.
- Use `tools/install-agent-assets.ps1 -TargetProject <project-path>` from the
  source `ai-tools` workspace to install this folder into another project.
- Update project wiki and affected `FEATURE.md` files when this structure
  changes.
- Run `powershell -NoProfile -ExecutionPolicy Bypass -File tools\verify-agent-assets.ps1`
  after moving or adding agent assets.
