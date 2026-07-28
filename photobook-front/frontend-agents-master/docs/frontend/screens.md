# Photobook Screens and Layouts

## Initial route inventory

| Route                         | Purpose                                      | Rendering/indexing     |
| ----------------------------- | -------------------------------------------- | ---------------------- |
| `/`                           | Product explanation and primary start action | Prerendered, indexable |
| `/books`                      | Formats, options, and pricing                | Prerendered, indexable |
| `/help`                       | Ordering and product help                    | Prerendered, indexable |
| `/login`                      | Authentication                               | SPA, noindex           |
| `/login/verify`               | One-time-code verification                   | SPA, noindex           |
| `/create`                     | Start a project and choose product/category  | SPA, noindex           |
| `/projects/:projectId/editor` | Manual constructor and future AI assistance  | SPA, noindex           |
| `/checkout/:projectId`        | Validate and place an order                  | SPA, noindex           |
| `/orders/:orderId`            | Order status                                 | SPA, noindex           |
| `/account`                    | Projects and orders                          | SPA, noindex           |
| `/operator/orders/:orderId`  | Internal read-only mock order review         | SPA, noindex           |
| `*`                           | Calm Not Found recovery with navigation home | SPA fallback, noindex  |

The root layout owns provider composition and the global connection indicator.
The root route boundary converts unknown failures to safe user-facing copy and
never displays raw status text, backend messages, or stack traces.

## Early public composition

- `/` uses four concise sections: value and primary start action, three-step
  creation path, the constrained manual-constructor principle, and one honest
  reference product. The next section begins within the first desktop viewport;
  the hero must not reserve an otherwise empty full screen.
- `/books` shows only the mock hardcover reference format. Prototype dimensions,
  options and spread limits are labelled as test data; price, materials and
  production time remain explicitly pending until the print gate is complete.
- `/help` is a practical guide to the implemented test path: supported photo
  formats, local-file recovery limits, manual editing, preflight and preview.
  It separates available prototype behavior from unconfirmed production,
  payment, privacy, legal and support conditions without dead contact forms.
- Public product illustrations combine code-native book frames with project-owned
  generated demonstration photographs and explicit concept captions. They do
  not claim to show customer archives or a manufactured sample.
- Categories preserve the story context without restricting templates. They do
  not claim to personalize the only available mock template. Calendars,
  cards, school and corporate requests remain outside the book constructor until
  the individual-request flow exists.

## Authentication composition

- `/login` accepts familiar Kyrgyzstan phone formats and normalizes them to
  E.164 before creating a challenge. It never reveals whether the number already
  has an account.
- `/login/verify` keeps only the opaque challenge ID, masked contact, and safe
  internal `returnTo` in the URL. The original phone and OTP never enter the
  route state.
- The development OTP is visible only in a development build. Invalid, expired,
  rate-limited, and provider failures use bounded Russian copy without raw
  backend messages.
- Public browsing and product configuration stay available without a session.
  Authentication is mandatory immediately before project persistence and
  original photo upload instructions are requested.
- `/account` owns authenticated, anonymous, loading, and retry states. Logout
  invalidates the RTK Query session and clears the in-memory CSRF token.

## Create flow composition

- `/create` is one route with four implemented UI steps: product, optional
  recommendation categories plus template, physical configuration, and photos.
  The final step separates local JPEG/PNG originals from the explicitly labelled
  seeded demo set. Authentication is a narrow gate before the final step, not a
  separate progress item.
- Step, product spec, repeated category tags, template, cover option, and spread
  count and seeded photo-set ID live in query parameters. Direct navigation and
  reload recover the first incomplete valid step instead of rendering a broken
  state.
- Categories remain optional and never remove a compatible template. One
  reference product and one approved mock template keep the walking skeleton
  focused while production inputs remain unresolved. When the catalog contains
  exactly one valid product or compatible template, the UI selects it safely,
  persists it in the URL and still lets the customer inspect the choice instead
  of requiring a meaningless selection click. The second step is named
  “История”, states that it is optional and exposes a direct skip action.
- The desktop composition keeps a sticky summary beside the active step. Mobile
  keeps one focused step first and places the same summary after it; no separate
  state or duplicated form exists. On physical configuration, the price is
  shown in the active decision area and omitted from the adjacent summary to
  avoid presenting the same calculation twice.
- Catalog and price-quote loading or retry states preserve URL selection. The
  displayed price comes from the `DRAFT` quote endpoint and remains explicitly
  provisional while production pricing is unresolved. A quote failure does not
  discard or block continued product configuration. Empty-book and AI starts
  are not exposed.
- Anonymous users are sent through phone OTP with a safe internal `returnTo` and
  return to the same selection. The final action calls the frozen create-project
  contract with CSRF and a stable retry key. The seeded path opens its non-empty
  demo document directly; the local path completes signed upload before opening
  a revision that references uploaded assets and has blank photo slots.
- The photo step now owns a mobile-first local queue for multiple JPEG/JPG/PNG
  files. Selection and drag-and-drop share the same validation, previews and
  removal controls. Unsupported, empty, duplicate, oversized and over-limit
  files are reported independently without clearing accepted photos. Until a
  local set or the demo set is selected, the screen explains why its primary
  action is unavailable.
- Local originals live only in a module registry for the current `/create`
  lifetime. Reload and tab closure intentionally require reselection. The queue
  reserves asset IDs, uploads at most three originals concurrently, completes
  them independently and shows per-file plus aggregate progress. Cancel, retry,
  controlled storage rejection and expired-URL renew retain the original in the
  registry. Inputs lock once project persistence starts, while the explicitly
  separate seeded path remains usable without pretending to upload files.
- The seeded path uses four project-owned generated demonstration photographs
  instead of abstract color swatches. Its asset-read mock returns those images
  through the same source map and renderer used by uploaded thumbnails.

## Editor composition

- Desktop uses a page rail, one central book surface, and a contextual properties
  panel. Tablet keeps the rail and moves properties below the canvas. Mobile
  keeps the canvas first, then horizontal page thumbnails and contextual tools.
- The same SVG renderer is used for the central surface and compact thumbnails;
  physical document coordinates are never derived from responsive CSS sizes.
- Selecting a photo slot opens a restrained asset panel with all, used, and
  unused filters. Selecting an asset already used in another slot opens an
  explicit inline swap confirmation and never replaces either photo silently.
- Project asset status, trusted pixel dimensions, and temporary thumbnails are
  loaded through a separate read model. Ready assets show the real thumbnail;
  processing or failed assets stay visible with bounded status copy and cannot
  be assigned until ready. A recoverable thumbnail-list failure never discards
  the editable document and exposes an explicit retry.
- Crop zoom is a local visual preview. It becomes one undoable command only after
  the user confirms it; cancel leaves the document and history untouched.
- Focal point dragging previews locally and commits crop plus focal point as one
  undoable history entry on pointer release. The marker supports arrow keys.
- Low-resolution feedback is attached to the selected slot, explains the print
  risk, and does not block continued editing. Backend preflight remains
  authoritative for production approval.
- The pages rail owns spread management. Adding creates a blank spread from an
  allowed existing layout, duplication preserves content with new entity IDs,
  and earlier/later controls commit one reorder command per completed action.
  Removing a spread requires inline confirmation, remains undoable, and is
  disabled at the ProductSpec minimum. Incomplete spreads show a warning on the
  affected thumbnail.
- Selecting a spread without an active element opens the layout panel. It shows
  only product- and theme-compatible spread layouts, exposes a photo-count
  filter only when multiple counts exist, and marks the current layout without
  allowing a no-op reapply. A layout change preserves compatible photo
  assignments and presentation, commits once, and remains undoable.
- Empty optional caption and date slots stay visible and selectable on the
  editable canvas. The contextual text panel names the field, distinguishes
  required and optional content, shows its catalog-defined character limit and
  style, and blocks an overflowing draft before it becomes a command. Clearing
  optional content remains an explicit undoable text command.
- With one approved mock theme, the contextual panel shows the actual page
  background, foreground text, and accent colors as labelled information rather
  than a fake selector. The same ThemeSpec drives the canvas, layout previews,
  and text rendering; arbitrary colors remain unavailable.
- Below the tablet breakpoint, a sticky four-action bar switches between pages,
  photo, layout, and text tools. It never exposes an empty AI action. Photo and
  text select an existing slot on the active surface, layout clears element
  selection only, and unavailable tools are disabled. Tablet and desktop keep
  the persistent rail and properties composition.
- Mobile photo, layout, and text settings use one non-modal bottom sheet above
  the fixed tool bar. It keeps the current book and save status visible, closes
  by a labelled 44 px button or Escape, and restores focus to the opening
  control. The same property forms render in the persistent tablet/desktop
  panel; they are never duplicated for responsive presentation.
- The project name is editable inline in the toolbar. Commit uses the existing
  `set_book_title` command, participates in undo/redo and autosave, and remains
  separate from editable text printed on the cover.
- The canvas and thumbnails share one SVG renderer whose `viewBox` is expressed
  in physical millimetres. Responsive layout and browser zoom may change only
  presentation size, never document coordinates.
- A compact local-preflight summary sits below the editor toolbar. It combines
  required-content validation and known mock-DPI warnings, announces changes
  politely, expands inline, and navigates to the affected surface and element.
  The same report drives thumbnail markers. It is explicitly preliminary and
  never claims to replace the later authoritative server preflight.
- The verified P5 photo states are recorded in the existing project Figma file
  as an optional historical reference; future code changes do not have to keep
  it synchronized:
  https://www.figma.com/design/1RuLKi3o6uHEjtNOmwMGn3

## Preview and approval composition

- `/projects/:projectId/preview` reads only the latest saved immutable revision.
  It never renders the unsaved editor draft or exposes editing controls.
- Preview also requires the project asset read model so the customer approves
  the actual available thumbnails rather than placeholders. A failed asset read
  blocks approval with retry while preserving the saved revision.
- The preview reuses `BookSurfaceRenderer` and physical document coordinates,
  shows cover and every spread, labels spreads by their real page ranges, and
  supports a reversible fullscreen view.
- The screen explicitly says that browser preview is not the print PDF or a
  promise of final color. Print rendering remains a separate production gate.
- Approval requires a clean local blocking report, six explicit customer
  checks, online authenticated state, and a revision-bound mock server
  preflight. Every server warning is presented with its affected surface and
  human-readable details before acknowledgement becomes available. Checklist
  labels cover the absence of names or dates and never claim print readiness.
- On wide screens the book and approval panel remain visible side by side. The
  local summary names every affected surface and explains the concrete issue;
  warnings use a warning tone and never look like a successful print check.
- Approval is immutable and belongs to one revision. Saving a newer revision
  keeps the earlier audit reference but returns the project to editing and
  requires approval again.
- Loading, anonymous, retry, offline, stale-revision, server-blocking, approved,
  and reapproval states use bounded Russian recovery copy.

## Checkout and order-status composition

- Checkout is a short Bishkek-only mock request: customer name, Kyrgyzstan
  phone, pickup or courier, and an optional comment. It never asks for payment
  details or pretends to submit a real production order.
- A sticky desktop summary follows the form; mobile keeps the form first and
  places the same summary after it. Price is labelled test-only and not an
  offer. Unknown pickup address, delivery price, manager and due date remain
  visibly unconfirmed. The summary immediately mirrors pickup or courier and
  the entered address so the customer can verify the request before submitting.
- Order creation requires the latest approved revision, two explicit test
  acknowledgements, the exact unexpired provisional quote shown in checkout,
  and a stable idempotency key for identical retries. Changing delivery requests
  a new quote; quote loading or failure preserves the completed form.
- `/orders/:orderId` shows a four-step readable timeline and the immutable
  checkout snapshot. Only the first mock step is active; the page explicitly
  says that it is static, no manager will contact the customer, and payment or
  manufacturing will not start. Refresh and polling are absent until statuses
  can really change.
- Loading, anonymous, stale approval, offline, validation, retry and missing
  order states use bounded recovery copy and retain form values where possible.

## Account and operator composition

- `/account` keeps projects, orders and profile in three URL-backed tabs so a
  refresh, deep link or browser navigation preserves the chosen section.
- Login preserves the complete safe account URL, including the active tab query,
  and returns the customer to that same section after OTP verification.
- Project cards expose only continue and saved-revision preview. Copy and delete
  remain absent until their contracts and recovery rules exist. Each card uses
  the existing `coverPreviewUrl` read model; an approved project says “Изменить
  макет” instead of implying that approval prevents further editing. Order cards
  reopen the existing customer status route; support is not implied before a
  real contact channel is approved. Order cards name the related project so
  multiple test requests remain distinguishable.
- Kyrgyzstan phone numbers are normalized for contracts and shown to people in
  the familiar `+996 555 123 456` presentation. The mobile public header keeps
  both create and account entry points visible without opening another menu.
- Anonymous users see the existing phone-login recovery. Project and order lists
  separately define loading, empty and retry states without hiding the profile.
- `/operator/orders/:orderId` is an unlinked internal read-only route. Its admin
  endpoint owns role authorization and returns customer, immutable revision
  summary, approval and preflight context.
- The operator screen explicitly excludes payment confirmation, print-file
  download and manufacturing mutations until their production gates are ready.

Document new major screens and significant layout changes. Every networked
screen should define meaningful loading, empty, retry, and unsynced states when
implemented. The editor must preserve work across recoverable failures.
