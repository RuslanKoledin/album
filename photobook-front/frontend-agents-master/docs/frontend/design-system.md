# Photobook Design System

## Direction

The interface uses a calm premium editorial direction inspired by matte paper,
linen covers, family archives, and physical book composition. Customer photos
must remain more visually prominent than application chrome.

## Color roles

The canonical runtime values live in `src/shared/config/styles/palette.ts` and
are mirrored into Tailwind variables in `colors.css`. An automated test prevents
the two representations from drifting.

- `paper-*`: warm application backgrounds and quiet secondary surfaces.
- `ink-*`: primary, secondary, and muted text.
- `accent-*`: primary interaction and visible focus.
- `surface` and `border`: cards, dialogs, and quiet separators.
- `control-border`: a 3:1 boundary for interactive controls on light surfaces.
- `success`, `warning`, `danger`, `info` with `*-soft`: explicit status roles.
- `cover-sand`, `cover-linen`, `cover-leather`: physical material previews.
- `selection`: native text selection.

Do not add raw product colors inside components. Add a documented semantic
token when a reusable role or material actually appears.

## Typography

- Body and interface: self-hosted Inter 400, 500, and 600 with
  `font-display: swap`.
- Editorial headings: Georgia with Times New Roman and system serif fallbacks.
- Current Russian copy must allow enough width for future Kyrgyz localization.

## Spacing and layout

- Use Tailwind's spacing scale before adding custom values.
- `.page-container` has a 76rem maximum width and 1rem mobile gutters.
- Public pages use responsive vertical spacing and `dvh` for viewport-aware
  minimum heights.
- Essential mobile tap targets are at least 44 CSS pixels high.

## Radius and elevation

- Pill actions use full radius.
- Primary surfaces use 1.5rem to 2rem radii.
- `shadow-surface`: calm cards and message pages.
- `shadow-floating`: dialogs and persistent floating status.
- `shadow-book`: physical book preview only.

## Motion and focus

- Use color transitions for ordinary hover feedback.
- Motion must explain placement, progress, save, or mode change.
- Global reduced-motion rules minimize animation and transition duration.
- All keyboard-focusable controls receive the semantic accent focus ring.
- Text selection and normal document scrolling remain enabled.

## Responsive breakpoints

Use the default Tailwind breakpoints. Design mobile-first; reveal secondary
marketing navigation at `sm` and introduce multi-column content only when the
available width supports it.
