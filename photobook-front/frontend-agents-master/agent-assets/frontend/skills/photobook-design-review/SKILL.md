---
name: photobook-design-review
description: Design, implement, and review Photobook interfaces with the project's calm premium editorial direction, responsive UX, accessibility, complete UI states, and browser-based visual QA. Use for new screens, major redesigns, editor or constructor interactions, reusable UI patterns, Figma compositions, visual implementation, responsive fixes, and design-quality audits in the Photobook frontend.
---

# Photobook Design Review

## Establish project truth

1. Read the closest `AGENTS.md`, the product plan, and the relevant route or
   component before proposing a visual direction.
2. Read
   `../../../frontend-design-plugin/skills/frontend-design/PROJECT_EXTENSION.md`.
   Treat it as authoritative for product tone.
3. Read the relevant files under `../../../../docs/frontend/` for existing
   tokens, components, screens, and durable UI decisions.
4. Read the generic
   `../../../frontend-design-plugin/skills/frontend-design/SKILL.md` only when
   designing a genuinely new visual direction. Do not let its generic boldness
   override the Photobook extension.

## Choose the workflow proportionally

- For a review-only request, inspect and report findings without changing files.
- For a small visual fix, preserve the established composition and go directly
  to implementation and browser verification.
- For a new major screen, flow, editor interaction, or substantial redesign,
  define the UX contract and normally implement it code-first against existing
  tokens, then iterate in the browser.
- Use Figma only when the user explicitly asks for it, stakeholders need a
  reviewable artifact before implementation, or a genuinely complex new flow
  benefits enough to offset duplicate design work. Figma is never a delivery
  gate and routine implementation does not require keeping it synchronized.

## Define the UX contract

Before designing a non-trivial surface, state:

1. the user's immediate goal and one primary next action;
2. necessary secondary actions and what can remain progressive disclosure;
3. required data, content hierarchy, and trust information;
4. loading, empty, error, offline, unsynced, disabled, and success states that
   are relevant to the flow;
5. expected behavior at mobile, tablet, and desktop widths;
6. destructive, irreversible, or print-quality risks and their recovery path.

Use concise Russian copy. Allow for longer future Kyrgyz text, realistic names,
prices, dates, filenames, and photo counts. Never present future AI assistance
as an available feature before it is implemented.

## Design and implement

1. Start mobile-first and protect a clear path to the main action.
2. Keep customer photographs and the physical product more prominent than
   application chrome.
3. Reuse documented semantic tokens and project-owned components. Add a new
   reusable primitive only for a stable interaction or a real second use.
4. Design every meaningful state together so loading and failure screens do not
   look like unrelated afterthoughts.
5. Preserve visible focus, semantic controls, keyboard access, readable
   contrast, reduced motion, and at least 44 CSS pixel essential tap targets.
6. Use motion only to explain placement, selection, progress, save, or mode
   change.
7. Use generated imagery only for clearly marked concepts, moodboards, or
   temporary placeholders. Never present generated books, materials, print
   quality, or customer memories as photographs of the real product.

## Protect constructor usability

For constructor and editor work, verify all relevant points:

- Make the active spread, selected object, hover target, drag target, keyboard
  focus, and disabled state distinguishable without relying on color alone.
- Keep the canvas, page hierarchy, undo/redo, save or sync status, and print
  validation available even when side panels or dialogs are open.
- Make crop, focal point, replacement, reordering, and text editing predictable
  and non-destructive.
- Tie bleed, safe-zone, resolution, overflow, and missing-photo warnings to the
  affected page, slot, or object and explain the next action in plain language.
- Commit durable changes at meaningful interaction boundaries; do not make
  visual movement imply a save that has not happened.
- On narrow screens, use focused modes or bottom sheets without hiding the
  current page, essential status, or a clear way back.
- Preserve the same visible document and settings when switching between future
  AI assistance and manual editing.

## Verify visually in a browser

After every visual implementation:

1. Run the relevant app and inspect the changed flow at approximately 390,
   768, and 1440 CSS pixels, omitting a size only when it cannot exercise the
   surface.
2. Exercise keyboard navigation, focus visibility, zoom, long text, realistic
   content, and all relevant UI states.
3. Check overflow, clipping, accidental scroll, layout shift, image crop, touch
   target size, contrast, and browser console errors.
4. Inspect screenshots and compare them with the UX contract or an optional
   design reference. Correct hierarchy, spacing rhythm, typography, photo
   emphasis, and visual noise before finishing.
5. Run the relevant tests, typecheck, lint, and production build required by
   the main frontend skill.

Use `../../../../docs/frontend/audit-checklist.md` as the completion checklist.
If browser verification cannot run, state exactly what remains unverified
instead of implying completion. Mention Figma only when it was explicitly part
of the requested workflow.

## Preserve durable design memory

Update `../../../../docs/frontend/` only when reusable tokens or components,
major screens, significant interactions, or lasting visual decisions change.
Do not create documentation churn for isolated spacing or copy corrections.
