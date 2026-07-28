# Project Extension: Photobook UI Direction

The generic frontend-design skill provides visual craft guidance. This file
overrides its tone and governance for the Photobook product.

## Product direction

Design a calm, premium editorial experience inspired by a physical photo book,
matte paper, family archives, and careful print composition.

The interface should feel:

- clear before impressive;
- warm and tactile rather than glossy or technological;
- premium but approachable for users with different digital experience;
- restrained enough that customer photographs remain the visual focus;
- trustworthy during upload, editing, approval, payment, and delivery.

Avoid maximalist layouts, decorative complexity, generic SaaS dashboards,
purple gradients, excessive glass effects, and animation that competes with the
book. Do not force an extreme visual direction merely to appear distinctive.

## Regional and language context

- Design mobile-first because many customers will choose photos from a phone.
- Use concise Russian product copy at the current stage.
- Keep layouts and components ready for future Kyrgyz localization without
  hard-coding narrow text widths.
- Keep categories culturally useful for Bishkek and Kyrgyzstan, but do not make
  the constructor structurally dependent on a specific event type.
- Prefer familiar actions and plain language over print-industry jargon.

## Editor priorities

The constructor is the core product, not a decorative landing-page demo.

Prioritize:

1. clear project/save/sync status;
2. visible page and spread hierarchy;
3. safe photo placement, crop, text, and layout controls;
4. understandable undo/redo and validation;
5. predictable transition between future AI assistance and manual editing;
6. print warnings that identify the affected page or photo;
7. responsive behavior without hiding essential editing state.

Use motion to clarify placement, selection, progress, save, or mode changes.
Respect reduced-motion preferences. Do not add motion solely as decoration.

## Component and token governance

- Reuse existing project components and CSS/Tailwind tokens first.
- Add a reusable component only when there is a real second use or a stable
  interaction primitive.
- Do not install shadcn or another UI kit automatically.
- Document new semantic colors, typography roles, spacing/radius scales,
  shadows, motion patterns, and breakpoints when they become reusable.
- Document meaningful reusable components and major screens; do not inventory
  trivial leaf markup.
- Prefer semantic tokens such as surface, ink, muted, accent, success, warning,
  and selection over arbitrary color names.

## Accessibility and verification

- Preserve visible focus, keyboard access, semantic controls, readable contrast,
  meaningful labels, and mobile tap targets.
- Do not communicate upload, sync, quality, or validation state by color alone.
- Verify relevant desktop and mobile sizes in a browser.
- Check long Russian text, future longer translations, overflow, zoom, loading,
  empty, error, and disabled states when relevant.
- Check browser console errors before completion.

Update project UI documentation only when reusable tokens/components, major
screens, or meaningful visual decisions change. A routine spacing correction
does not require a new decision record.
