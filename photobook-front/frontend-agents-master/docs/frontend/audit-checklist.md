# Photobook Frontend Audit

Use the checks relevant to the change.

## Product and interaction

- The primary next action is clear and copy remains concise.
- Major new screens or interactions have a concise UX contract. Figma is used
  only when it was explicitly requested or materially helped stakeholder review.
- Loading, empty, error, offline, unsynced, disabled, and success states were
  considered together where relevant.
- Editor state, selection, save/sync, upload, and validation are understandable.
- Recoverable failures preserve the user's project and provide a next action.
- Offline mode blocks only network-dependent work when local editing is safe.

## Visual and responsive

- Existing tokens and components were reused where practical.
- Customer photos remain the visual focus.
- No clipped text, overlap, accidental horizontal overflow, or unstable layout.
- Approximately 390, 768, and 1440 CSS pixel widths were inspected when
  relevant.
- Long Russian text and likely longer translations remain usable.
- Screenshots were compared with the intended composition, and hierarchy,
  spacing rhythm, typography, crop, and visual noise were corrected.

## Accessibility

- Keyboard and visible focus work for changed interactions.
- Labels and status semantics are meaningful.
- Color is not the only signal.
- Dialog focus and dismissal behavior are safe.
- Essential mobile targets are at least 44 CSS pixels.

## Constructor

- Active spread, selection, hover, drag, focus, and disabled states are clear.
- Canvas, page hierarchy, undo/redo, save/sync, and validation remain reachable.
- Crop, replacement, reordering, and text editing remain non-destructive.
- Print warnings identify the affected page, slot, or object and the next step.
- Narrow-screen panels do not hide essential project state or navigation back.

## Runtime and quality

- Tests justified by changed risks, typecheck, lint, and build passed.
- Changed routes and direct navigation work.
- Browser console errors were checked.
- Unknown routes and relevant failure/recovery states were verified.
- Documentation changed only when reusable tokens/components, major screens, or
  durable UI decisions changed.
