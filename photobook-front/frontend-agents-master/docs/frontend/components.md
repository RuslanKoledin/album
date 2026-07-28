# Photobook UI Components

Record meaningful reusable components after they exist in the consuming app.
Do not predeclare a component library.

## Inventory

| Component | Source path | Purpose | Variants/states | Accessibility | Status |
| --- | --- | --- | --- | --- | --- |
| `CenteredMessagePage` | `src/shared/ui/CenteredMessagePage` | Shared structure for calm full-page messages | Eyebrow, title, description, actions | Labelled section and semantic heading | Implemented |
| `AppPlaceholderPage` | `src/shared/ui/AppPlaceholderPage` | Consistent temporary route message | Product-specific eyebrow and copy | Semantic message page and home navigation | Implemented |
| `AppErrorPage` | `src/shared/ui/AppErrorPage` | Safe root-level recovery screen | Generic error, missing route | Heading, native actions | Implemented |
| `ErrorDialog` | `src/shared/ui/ErrorDialog` | Blocking recovery decision | Retry, close, retry + close | Alert dialog, labelled description, focus trap, scroll lock, Escape when closable | Implemented |
| `ConnectionStatus` | `src/shared/ui/ConnectionStatus` | Non-blocking offline feedback | Online (hidden), offline | Polite live status; text does not rely on color | Implemented |

## Rules

- Reuse existing project components first.
- Add an external primitive only for a concrete accessibility or interaction
  need; do not install shadcn or another kit automatically.
- Extract after a real second use or stable product boundary appears.
- Document default, focus, disabled, loading, error, empty, and offline/unsynced
  states only when the component owns them.
- Keep domain components inside their modules and generic primitives in
  `shared/ui`.
