---
type: concept
status: current
updated: 2026-07-21
tags:
  - photobook
  - react
---

# React Patterns for Photobook

## Components

- Keep route pages compositional and move domain behavior into modules.
- Keep presentational components prop-driven and free of API knowledge.
- Prefer composition over broad components with many mode flags.
- Extract an abstraction after a clear boundary or second real use appears.
- Use stable domain IDs as keys for pages, spreads, slots, assets, and blocks.

## State placement

- Use local state for a single component or short-lived interaction.
- Use `useReducer` for cohesive local transitions that do not belong in the
  durable book document.
- Use URL params/search for linkable navigation state.
- Use RTK Query for server state.
- Use Redux Toolkit for the active serializable editor session and history.
- Derive values during render instead of mirroring props, API data, or computed
  values into another state store.

## Effects and React 19

- Keep render pure and deterministic.
- Use effects only to synchronize with an external system such as browser
  events, storage, observers, canvas, or an imperative library.
- Use event handlers for user-caused work.
- Use transitions, optimistic state, and Actions only when they simplify the
  existing Redux/RTK Query flow; do not create a second mutation architecture.
- Measure before adding memoization. Prioritize narrow subscriptions and small
  components in the editor.

## Editor interaction

- Keep pointer movement and draft geometry local while dragging or resizing.
- Commit one domain command at the end of an interaction.
- Preserve user work across recoverable failures and route boundaries.
- Treat book document migrations and command compatibility as domain concerns,
  not component concerns.

## Testing

- Unit-test pure book logic and mappings.
- Integration-test meaningful component and Redux behavior.
- Test accessibility and failure states users can encounter.
- E2E-test critical completed flows when their backend contracts exist.
- Verify visual-only changes in the browser instead of writing assertions for
  arbitrary CSS details.
