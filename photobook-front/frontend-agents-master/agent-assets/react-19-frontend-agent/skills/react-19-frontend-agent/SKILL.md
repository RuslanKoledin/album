---
name: react-19-frontend-agent
description: Compatibility entry point for React 19 work in the Photobook frontend. Use when an existing workflow invokes this legacy skill for React components, hooks, routes, state, or frontend architecture; delegate project decisions to the active Photobook frontend-agent.
---

# React 19 Compatibility Entry Point

Read and follow
`../../../frontend/skills/frontend-agent/SKILL.md` as the authoritative
Photobook frontend skill.

Use the local sub-skills only for focused guidance:

- `../react-19-patterns/SKILL.md` for component, hook, state, purity, and
  performance patterns.
- `../typescript-react-routing/SKILL.md` for the existing React Router Framework
  Mode routes.

Do not invoke `nextjs-app-router-practices` for Photobook. Do not replace React
Router, Redux Toolkit, or RTK Query with TanStack Router, TanStack Query, or
Zustand. Explicit project decisions and the active frontend-agent take
precedence over legacy references stored in this package.
