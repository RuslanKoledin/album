# Agent Assets

## Purpose

`agent-assets/` is the canonical folder for local agent-facing packages in this
workspace. It keeps skills, agent configs, and rule/reference resources together
instead of spreading plugin folders across the repository root.

## Entry Points

- `README.md`: short maintainer guide for the consolidated folder.
- `project-documentation-wiki/`: documentation wiki skill, OpenAI agent
  metadata, wiki init script, and LLM wiki reference.
- `frontend/`: Codex-first frontend plugin with `frontend-agent` and
  `frontend-error-ux` skills.
- `react-19-frontend-agent/`: earlier React 19 frontend agent plugin and
  supporting sub-skills.
- `frontend-design-plugin/`: local mirror of the frontend design skill and
  project extension rules.
- `../tools/install-agent-assets.ps1`: installer that copies this bundle into
  another project and creates project-local startup rules.
- `../tools/verify-agent-assets.ps1`: structure verification script.

## Behavior

- New local agent plugins should be added under `agent-assets/`.
- New frontend projects should receive this folder through
  `../tools/install-agent-assets.ps1 -TargetProject <project-path>` so skills,
  agents, wiki startup, and frontend docs are created inside that project.
- The bundled frontend project startup includes `frontend-error-ux`, which must
  immediately audit the initialized app for a 404 page, blocking error
  modal/dialog, and offline screen blocker that tells the user there is no
  internet connection.
- Skill folders should keep their `SKILL.md`, `agents/`, and `references/`
  together inside the owning plugin package.
- Root-level project rules remain in `../AGENTS.md` so Codex can still discover
  them automatically.
- Project wiki pages and affected local `FEATURE.md` files should be updated
  whenever agent assets move or new packages are added.

## Dependencies

- `../AGENTS.md` for project-wide operating rules.
- `../docs/wiki/` for central project memory.
- `../docs/frontend/` for frontend UI governance memory used by the packaged
  frontend skills.

## Verification

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\verify-agent-assets.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\test-install-agent-assets.ps1
```

Expected result:

- `agent-assets/` exists.
- The `frontend`, `react-19-frontend-agent`, and `frontend-design-plugin`
  packages are under `agent-assets/`.
- The `project-documentation-wiki` skill is under `agent-assets/`.
- Root-level `frontend`, `react-19-frontend-agent`, and
  `frontend-design-plugin` folders are absent.
- At least 7 skill files, 6 agent config files, and 20 reference/rule files are
  found under `agent-assets/`.

## Test Case Checklist

- Happy path: consolidated folder contains every expected local plugin package.
- Bootstrap: installer creates project-local `agent-assets/`, `AGENTS.md`,
  `docs/wiki/`, and `docs/frontend/` in a new target project.
- Error UX bootstrap: installer includes the `frontend-error-ux` skill and
  managed startup rule for 404, error modal, and offline blocker checks.
- Regression: old root plugin folders are not recreated after consolidation.
- Validation: plugin manifests remain parseable JSON and include names.
- Coverage: skills, agent configs, and reference/rule files are counted by the
  verification script.
- Documentation: wiki, root rules, and local feature docs point at
  `agent-assets/` paths.

## Wiki Links

- `../docs/wiki/workflows/agent-assets-consolidation.md`
- `../docs/wiki/workflows/frontend-agent-plugin.md`

## Open Questions

- Whether these local packages should later be installed into a personal or
  shared plugin marketplace remains separate from this folder consolidation.
