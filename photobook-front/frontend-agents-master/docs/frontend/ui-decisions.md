# Photobook UI Decisions

## 2026-07-21: Calm premium editorial direction

- Use warm, restrained, tactile presentation inspired by photo books and matte
  paper.
- Keep customer photographs visually dominant.
- Optimize photo selection/upload for mobile and detailed editing for larger
  screens.
- Use concise Russian copy now and leave space for future Kyrgyz localization.
- Keep event categories helpful but never structurally restrictive.
- Prefer project-owned components; do not add a UI kit automatically.

## 2026-07-21: Code-first design workflow

- Implement against the established design system and iterate in the browser by
  default.
- Use Figma only for an explicit user request, stakeholder review before code,
  or an unusually complex new flow where a separate composition saves rework.
- Do not block delivery or require routine Figma synchronization.

## 2026-07-21: Recovery without lost work

- Show connection and synchronization state without blocking safe local edits.
- Block only network-required actions while offline.
- Tie quality and validation warnings to the affected photo, slot, or spread.
- Use blocking dialogs only when acknowledgement or a decision is required.

## 2026-07-21: Semantic tokens and local typography

- Keep the TypeScript palette and Tailwind CSS variables synchronized by test.
- Use warm `paper`, restrained `ink`, terracotta `accent`, and explicit
  `success`, `warning`, `danger`, and `info` state colors.
- Keep physical cover preview colors as named material tokens instead of raw
  hex values inside components.
- Self-host only the Inter weights currently needed by the interface and use
  `font-display: swap`; retain the system serif stack for editorial headings.
- Preserve text selection and normal document scrolling. Global webview rules
  that disable selection or overscroll are inappropriate for the public site
  and text editor.
- Provide visible `focus-visible`, reduced-motion behavior, and semantic image
  defaults in the global stylesheet.

## 2026-07-21: Photo actions remain explicit and reversible

- Keep all, used, and unused photo filters in one contextual panel instead of a
  separate media-library screen for the MVP.
- Allow direct assignment of unused assets. Keep assets used elsewhere visible
  and require an explicit inline swap confirmation to prevent accidental
  duplication or replacement.
- Render crop changes locally while the control is active. Commit one
  `set_photo_crop` command only on explicit confirmation so undo and autosave
  reflect a completed user action rather than every slider movement.
- Use abstract gradients for seeded demo assets. Do not imply that placeholder
  artwork is a real customer photograph or a production sample.

## 2026-07-21: Focal point and print quality ownership

- Keep pointer movement transient. Commit crop and focal point together as one
  history batch on pointer release; provide arrow-key adjustment for precision.
- Keep pixel dimensions in asset metadata, not in `BookDocumentV1`. The document
  references assets by opaque ID and remains independent from expiring preview
  URLs and processing state.
- Frontend DPI feedback is early guidance attached to the affected slot. The
  backend preflight result is authoritative before approval and printing.

## 2026-07-21: Spread management stays explicit and reversible

- Keep add, duplicate, move, and remove actions next to the page hierarchy
  instead of hiding them in the properties panel.
- Create blank spreads from an allowed existing layout; duplicate content only
  with new spread, photo-slot, and text-block IDs.
- Commit one reorder command per completed earlier/later action. Drag-and-drop
  is not required for the MVP while explicit controls remain clearer on mobile.
- Require inline confirmation before removing a spread, preserve photos in the
  project, support undo, and disable removal at the ProductSpec minimum.
- Attach incomplete-content warnings to the affected thumbnail with an icon and
  text rather than color alone.

## 2026-07-21: Layout selection uses the shared book command model

- Show layout choices only for a selected spread and filter them through
  ProductSpec and ThemeSpec compatibility before rendering.
- Derive thumbnails from LayoutSpec geometry; do not create a second visual
  layout configuration in React.
- Apply one `set_spread_layout` command. Preserve photos by matching slot key
  first and then source order, including crop and focal point. Unplaced photos
  remain in the project asset library.
- Preserve compatible non-empty text first, use target slot defaults for role
  and style, and make the complete change reversible through history.
- Keep the initial mock catalog at three layouts until the product gate justifies
  broader choice.

## 2026-07-21: Text editing remains catalog-constrained

- Use existing text roles for field meaning: title for a heading, caption or
  body for a description, and subtitle for a date. Do not add UI-only document
  fields.
- Keep optional empty text slots visible on the editable canvas so users can
  add a caption or date without discovering an invisible target.
- Define `maxCharacters` on each layout text slot and validate it in core.
  Show the exact excess beside the field and do not commit an overflowing
  draft.
- Resolve size, alignment, and foreground/accent color through ThemeSpec text
  styles. Do not expose arbitrary typography that the print configuration does
  not allow.
- Commit normalized text once on submit. Clearing optional content uses the
  existing undoable `remove_text` command.

## 2026-07-21: Do not fake theme choice

- When the product has one approved theme, show its background, foreground, and
  accent as labelled applied settings instead of rendering a one-item chooser.
- Use the same ThemeSpec colors in the book canvas, layout previews, text, and
  the contextual palette summary.
- Keep arbitrary color input unavailable. Additional theme selection becomes a
  real control only after production-approved alternatives exist in the catalog.

## 2026-07-21: Mobile tools use explicit contextual tabs

- Keep the canvas visible and switch only the supporting mobile panel between
  pages, photo, layout, and text. Do not add an AI tab before AI exists.
- Store the active mobile tool in transient React state. Tool navigation does
  not create a book command, autosave change, or history entry.
- Selecting a photo or text tool targets an existing slot on the active surface.
  Disable layout on the cover and text on a surface without text slots rather
  than opening an unrelated or empty panel.
- Selecting an object directly on the canvas activates its matching mobile tool.
  Keep tablet and desktop behavior unchanged above the mobile breakpoint.
- Reserve bottom space and device safe-area padding so the sticky tool bar does
  not make the final controls unreachable.

## 2026-07-22: Mobile properties stay contextual and non-modal

- Open photo, layout, and text properties in one fixed bottom sheet above the
  mobile tool bar. Keep the current canvas, save status, and tool switching
  available instead of adding a blocking overlay.
- Render the same property panel once across responsive modes. Do not duplicate
  forms, local drafts, IDs, or command wiring for mobile.
- Move focus to the labelled close control on open, support Escape, and return
  focus to the opening control on close. Keep primary targets at least 44 px.
- Align the mobile canvas toward the visible top area while the sheet is open,
  but keep SVG geometry in a millimetre-based `viewBox`; responsive layout and
  browser zoom affect presentation only.

## 2026-07-22: Phone OTP is a narrow authentication gate

- Accept common Kyrgyzstan phone notation in the UI and normalize to E.164 at
  the request boundary. Keep challenge responses neutral to account existence.
- Put only an opaque challenge ID, masked contact, and validated internal
  `returnTo` in the verification URL. Reject external, protocol-relative,
  backslash-containing, oversized, and authentication-loop destinations.
- Keep the mock OTP visible only under `import.meta.env.DEV`; never persist the
  code, raw phone, session secret, or CSRF token in the URL or browser storage.
- Model session bootstrap as server state in RTK Query. Keep CSRF in memory,
  invalidate the session on logout, and show bounded product-owned error copy.
- Seed the development mock session as authenticated so existing editor and
  autosave work remain directly testable; use account logout to exercise the
  complete sign-in path.
- Do not add email fallback until delivery evidence or product research shows a
  real need. Public discovery and configuration remain guest-accessible; the
  gate belongs immediately before original uploads and project persistence.

## 2026-07-22: Creation starts with constrained URL-backed choices

- Keep `/create` as one route. Store only compact catalog identifiers,
  recommendation tags, cover option, spread count, and current step in query
  parameters so reload and browser navigation preserve progress without local
  persistence.
- Use categories only as optional recommendation metadata. Never make template
  compatibility or product availability depend on an event category.
- Show one reference product and compatible catalog templates rather than fake
  breadth before production validation. Do not expose empty-book or AI starts.
- Keep the active step primary and show the same derived summary after it on
  mobile or beside it on desktop. The summary never owns duplicate state.
- Until the Price contract is frozen, calculate a clearly labelled local test
  estimate. Do not create a quote ID, expiry, confirmed status, or other server
  semantics that the frontend cannot guarantee.

## 2026-07-22: Seeded creation proves persistence before upload

- Keep authentication as a gate before the photo step and project persistence,
  not as a fifth visual choice. Preserve the complete `/create` query through a
  validated internal OTP return URL.
- Label seeded assets as abstract demonstration data. Do not imply that personal
  files were uploaded or that these placeholders are print samples.
- Create only a non-empty project. Derive its spread count and option selections
  from the same URL-backed configuration used by the summary and editor.
- Reuse one idempotency key for retries of the same create body and allocate a
  new key only after configuration changes. Translate failures to bounded copy;
  never expose backend messages.
- Treat offline as a recoverable state: keep the URL selection, disable only the
  network action, and let the user retry after reconnection.
- Keep real `File`/`Blob`, JPEG/PNG validation, signed upload and progress outside
  this slice and add them in P6.3 without adding upload fields to `POST /projects`.

## 2026-07-22: Local photo ownership precedes network upload

- Accept JPEG/JPG and PNG first through one multiple file input that works with
  mobile galleries and desktop drag-and-drop. Keep HEIC unavailable until the
  separate conversion and retry spike succeeds.
- Validate type, non-zero size, the provisional 25 MB per-file limit, the
  provisional 50-file queue limit and exact local duplicates before network
  work. Reject individual files without clearing accepted items.
- Keep `File`, object URL and file lookup inside a `photo-upload` registry owned
  by the `/create` lifetime. React renders derived previews only; Redux, RTK
  Query, URL state and project DTOs remain serializable and file-free.
- Revoke object URLs on individual removal, clear-all and route unmount. State
  plainly that reload or tab closure requires selecting originals again until
  backend upload recovery exists.
- Do not animate or simulate upload progress before the signed-upload contract
  exists. Keep the seeded demo choice visually separate so it cannot be
  mistaken for the user's local originals.

## 2026-07-22: Early public pages explain value without fake breadth

- Keep the home page to four product-focused sections and one primary action.
  Show the next section within the first desktop viewport instead of stretching
  a sparse hero to the full screen.
- Explain the path, constrained manual constructor and category recommendations
  before adding marketing decoration or broad product discovery.
- Show one hardcover reference format on `/books`. Label prototype dimensions,
  cover options and spread limits as test data; do not publish Layflat, prices,
  production time or materials before the print gate confirms them.
- Combine clearly captioned code-native product frames with project-owned
  generated demonstration photographs until licensed photographs of real
  manufactured samples exist.

## 2026-07-22: Demonstration photo slots should look intentional

- Use photographic content inside marketing, template and seeded-project slots;
  reserve plain color or geometric fallbacks for genuinely empty, loading,
  processing or failed asset states.
- Reuse one cohesive project-owned demonstration set across public concepts,
  create previews and the mock asset read model so the visual promise matches
  the editor experience.
- Label generated content as demonstration imagery and keep product concepts
  distinct from photographs of manufactured books or real customer archives.
- Replace generated demonstration imagery with licensed real product and sample
  photography only after the production and rights gates are complete.

## 2026-07-22: Help separates guidance from production promises

- Give visitors a complete guide to the currently implemented test path instead
  of placeholder questions or speculative customer-service copy.
- Explain supported files, reload limitations, preliminary validation and the
  difference between browser preview and a print PDF in plain Russian.
- Keep price, payment, production time, delivery, privacy, legal terms and
  support visibly pending until their owners complete the corresponding gates.
- Do not collect individual-request contact data before the privacy, retention
  and operating process are approved.

## 2026-07-22: Local preflight is one derived report

- Derive local preflight from core document validation and known mock photo
  metadata. Do not keep a second warning validator in the page rail.
- Treat missing required content and invalid document structure as errors. Keep
  low mock-DPI as a non-blocking warning because backend asset metadata and
  server preflight remain authoritative.
- Attach each resolvable issue to its surface and element. Use the same report
  for the inline summary, issue navigation and thumbnail markers.
- Expand the summary inline instead of opening a modal. Label it preliminary and
  do not claim that fold, production tolerance or print readiness is verified
  before the production and server-preflight gates.

## 2026-07-22: Preview approves a saved immutable revision

- Open preview only after editor autosave reaches an idle or saved state. Keep
  the action visible but disabled while work is dirty, saving, offline, failed,
  or conflicted so an unsaved draft cannot be mistaken for the reviewed version.
- Reuse the editor SVG renderer for cover and spreads. Preview changes only
  navigation and presentation scale; it does not copy layout rules or mutate
  the document.
- Keep checklist and approval beside the book on wide screens and after the
  viewer on narrow screens. Do not hide legal-impact confirmation in a modal.
- Run the contract mock preflight at approval time and bind the result to the
  current `revisionId`. Require explicit acknowledgement if server warnings
  appear after local validation.
- Treat approval as an audit record, not a mutable project flag. A later save
  preserves `approvedRevisionId` as history while changing status to editing;
  checkout accepts only an approval matching the latest revision.
- Label the browser image as a composition preview, never as a print PDF or
  accurate proof of manufactured color.

## 2026-07-22: Asset previews are a replaceable read model

- Keep only stable asset IDs in `BookDocumentV1`. Processing status, trusted
  pixel dimensions, temporary thumbnail URL, and its expiry belong to the
  project asset response.
- Derive one asset-ID-to-source map for the shared SVG renderer. Never persist a
  signed URL through a book command or autosave revision.
- Keep the editor document usable when the asset read fails, disable assignment
  until an explicit retry succeeds, and show processing or failed assets with
  bounded status copy.
- Require a successful asset read in preview before approval because the user
  must verify the actual available images. Refetch temporary URLs on focus and
  reconnect through RTK Query.
- Keep uploaded mock bytes only for the current runtime. Do not claim reload or
  cross-session recovery before backend storage integration.

## 2026-07-22: M2 checkout creates a request, not a fake sale

- Keep checkout to one contact/delivery form and one derived summary. Do not add
  payment tabs, discount mechanics, address lookup, partner code or account
  upsells before their business and contract gates.
- Support pickup and courier only within Bishkek for the walking skeleton. State
  that pickup address, delivery charge and production time require later manual
  confirmation.
- Label every price and order number as mock. Ask the customer to acknowledge
  the approved layout and test nature of the request; do not link to or imply a
  legal offer that does not yet exist.
- Require the latest approved revision at both UI and mock endpoint boundaries.
  Reuse one idempotency key only for an identical create body.
- Show a calm four-step status timeline, but keep only the created step active.
  Poll through RTK Query and never manufacture fake progress over time.

## 2026-07-22: Account is a compact continuation surface

- Keep projects, orders and profile as URL-backed tabs on one route instead of
  creating a dashboard or separate nested pages.
- Make continue project, saved preview and reopen order the only current item
  actions. Do not show disabled copy, delete, repeat-order or support actions
  before their contracts and recovery paths exist.
- Fetch project and order lists only after authenticated session bootstrap and
  keep their loading, empty and retry states independent.

## 2026-07-22: Full-flow copy must reflect the current product gate

- Separate the local demo calculation from a public selling price everywhere.
  Until production approves a price, no page may imply that the displayed mock
  total is an offer.
- Let an optional category preserve story context, but do not claim personalized
  recommendations while the catalog contains only one compatible template.
- In M2, approval fixes a saved revision for a test request. Avoid “ready for
  print” wording because the browser preview is neither a print PDF nor a color
  proof.
- Display every late preflight recommendation, affected surface and available
  measurement before asking for acknowledgement. A count without the actual
  issue is not informed confirmation.
- Preserve URL-backed account tabs through authentication, name the related
  project on each order card, and format normalized Kyrgyzstan phones for human
  reading without changing their contract representation.

## 2026-07-22: Provisional price is a server-owned quote

- Do not duplicate price rules in configurator, checkout or order UI. Request a
  quote for the exact immutable catalog version, product spec, options, spread
  count, quantity and delivery method.
- Keep the M2 quote visibly provisional and non-binding. Its presence does not
  imply an offer, approved production cost, delivery fee or ready date.
- Bind checkout to the `quoteId` it displayed. Order creation validates that the
  quote is current and matches the approved document and delivery choice; it
  never accepts an amount from the browser.
- Configuration may continue if an early quote is unavailable. Checkout keeps
  entered data but blocks submission until retry produces a current quote.

## 2026-07-22: M2 operator review is read-only

- Keep the operator route out of customer navigation and authorize its admin
  read model on the server session rather than exposing a client role claim.
- Return an immutable revision summary, approval and preflight run with the
  order; do not send the complete book document merely to render metadata.
- Do not imitate a queue, payment confirmation, print PDF or production status
  mutation before M5 and the corresponding backend/audit gates.

## 2026-07-22: Signed upload preserves local ownership and asset identity

- Create the project first, then reserve one stable asset ID per local file with
  an idempotent upload batch. Never put `File`, `Blob` or signed URLs into Redux,
  RTK Query cache, route state or the book document.
- Send originals directly to the signed PUT URL with at most three concurrent
  transfers. Use real transport progress when it is observable; do not animate
  invented percentages in the MSW storage path.
- Keep cancel, storage rejection and expired URL as recoverable queue states.
  Retain the local original and renew only the short-lived instruction for the
  same asset ID before retry.
- Complete each object separately. Open the editor only after every selected
  asset is confirmed and a new project revision references those asset IDs.
  Clear seeded photo assignments so demo content never masquerades as uploaded
  customer content.
- Lock product, template and local selection after project creation starts.
  Cross-session recovery, thumbnails and processing states require a separate
  backend asset-list contract and are not implied by the mock-first lifecycle.

## 2026-07-22: Full-flow usability keeps one honest next action

- Auto-select and URL-persist a product or compatible template only when the
  catalog offers exactly one valid choice. Keep the choice visible for review,
  but do not make the customer click it merely to continue.
- Present the category step as optional story context, use a direct skip action
  when nothing is selected, and never describe one approved template as a
  personalized recommendation.
- Use one mock-price calculation from configuration through checkout and order
  history. Checkout delivery details must mirror the current form values rather
  than showing a generic Bishkek label.
- Allow the project name to change through the existing document command; keep
  it distinct from cover text, label that distinction in preview and checkout,
  and preserve undo, autosave and revision rules.
- Show real project-owned preview imagery in product and account cards. Keep
  decorative preview labels out of control accessible names.
- Put the approval rail beside the book from the desktop breakpoint and list
  the surface, severity and consequence of every local preflight issue.
- Describe upload persistence, test ordering and unconfirmed production facts
  exactly as implemented. Do not imply durable storage, payment or fulfillment
  while the walking skeleton is backed by in-memory mocks.
- Explain the missing prerequisite next to a disabled primary action. A customer
  should not have to infer that photos or a demo set must be selected.
- Keep a mock order status static and say so. Do not poll, offer manual refresh,
  promise manager contact or imply that production will start in M2.
