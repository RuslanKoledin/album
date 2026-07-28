---
name: frontend-error-ux
description: Design, implement, review, or test Photobook frontend failure and recovery states, including 404 and crash fallbacks, project autosave and synchronization, offline editing, photo upload failures, invalid book layouts, render/export failures, authentication, checkout, payment, and safe API error messages.
---

# Photobook Error and Recovery UX

## Principles

- Preserve the user's book and explain the next useful action.
- Never display raw backend messages, stack traces, provider details, payloads,
  SQL text, or untranslated status text.
- Keep technical details in developer logs and structured error objects.
- Use calm Russian copy and avoid blame or alarmist styling.
- Use a modal only when the workflow is actually blocked or a decision is
  required. Prefer inline states, banners, and retry controls otherwise.

## App-level surfaces

Maintain:

- a designed catch-all 404 page with navigation home;
- a root route error boundary that prevents a white screen;
- an accessible blocking dialog primitive when acknowledgement or a recovery
  decision is required;
- a persistent connection/synchronization indicator for network-dependent
  work.

Do not block the whole editor merely because connectivity is lost. If local
editing is safe, continue accepting commands, mark the project as not synced,
pause network work, and resume automatically when connectivity returns. Block
only actions that require the network, such as uploading, checkout, payment, or
server rendering.

## Required Photobook scenarios

- Photo upload failed, was cancelled, or its signed URL expired: preserve the
  local item and offer retry.
- Project autosave failed: keep edits locally, show unsynced status, and retry
  without duplicating commands.
- Session expired: preserve recoverable work before asking the user to sign in.
- Photo quality is insufficient: identify the affected slot and explain the
  print risk without silently removing the photo.
- Book validation failed: navigate to or identify the affected spread/element.
- Print render/export failed: keep the approved project and allow retry.
- Checkout or payment failed: keep the order/project context and provide a safe
  retry or return path.
- A newer server version conflicts with local edits: do not overwrite either
  version silently.

## Accessibility

- Use `role="status"` for non-blocking updates.
- Use `role="alert"` sparingly for immediate failures.
- Use `role="dialog"` or `role="alertdialog"` only for blocking decisions.
- Manage focus, keyboard dismissal when safe, and responsive overflow.
- Do not use color as the only status signal.

## Verification

Test the failure state at the narrowest valuable level. Prioritize autosave,
upload retry, command preservation, offline-to-online recovery, validation,
checkout, and payment behavior. In the browser, verify unknown routes, the root
fallback, offline status, restored connection, keyboard focus, responsive text,
and absence of raw technical messages.
