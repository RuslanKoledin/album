# Agent Assets

Canonical project-local packages for the Photobook frontend:

- `frontend/`: active frontend and error-recovery skills.
- `react-19-frontend-agent/`: React pattern/routing sub-skills plus a legacy
  compatibility entry point.
- `frontend-design-plugin/`: mirrored generic design skill and the authoritative
  Photobook project extension.
- `project-documentation-wiki/`: optional durable Wiki workflow used while
  maintaining this source bundle.

The active Photobook stack is React Router Framework Mode, Redux Toolkit, RTK
Query, Tailwind, and a pure `core/book` command layer. Imported TanStack,
Zustand, shadcn, and Next.js files are historical references and are not active
defaults.

Use `../tools/install-agent-assets.ps1` only when PowerShell is available. The
current Photobook project activates the canonical skills through its own
root-level `AGENTS.md` without copying this folder.
