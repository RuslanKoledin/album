# React 19 Compatibility Package

## Purpose

This older package remains for compatibility with existing skill names. Its
main skill delegates architecture and stack decisions to
`agent-assets/frontend/skills/frontend-agent/SKILL.md`.

## Active sub-skills

- `react-19-patterns`: generic React component and hook guidance.
- `typescript-react-routing`: Photobook React Router Framework Mode guidance.

The bundled Next.js skill and older reference files are historical material and
are not active for Photobook. They must not override React Router, Redux Toolkit,
RTK Query, or the pure `core/book` architecture.

## Verification

Validate the compatibility skill and active sub-skills with the system
`quick_validate.py` script.
