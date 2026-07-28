import { useId } from 'react'

import { useErrorDialogFocus } from './useErrorDialogFocus'

interface BaseErrorDialogProps {
  closeLabel?: string
  description: string
  open: boolean
  retryLabel?: string
  title: string
}

type ErrorDialogProps = BaseErrorDialogProps &
  (
    | { onClose: () => void; onRetry?: () => void }
    | { onClose?: () => void; onRetry: () => void }
  )

export function ErrorDialog({
  closeLabel = 'Закрыть',
  description,
  onClose,
  onRetry,
  open,
  retryLabel = 'Попробовать снова',
  title,
}: ErrorDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const { closeActionRef, dialogRef, retryActionRef } = useErrorDialogFocus({
    onClose,
    open,
  })

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink-950/45 p-4"
      role="presentation"
    >
      <section
        ref={dialogRef}
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl border border-border bg-paper-50 p-6 shadow-floating sm:p-8"
        role="alertdialog"
        tabIndex={-1}
      >
        <h2 id={titleId} className="font-serif text-3xl leading-tight">
          {title}
        </h2>
        <p id={descriptionId} className="mt-4 leading-7 text-ink-700">
          {description}
        </p>

        <div className="mt-7 flex flex-wrap justify-end gap-3">
          {onClose ? (
            <button
              ref={closeActionRef}
              className="rounded-full border border-control-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-paper-100"
              type="button"
              onClick={onClose}
            >
              {closeLabel}
            </button>
          ) : null}
          {onRetry ? (
            <button
              ref={retryActionRef}
              className="rounded-full bg-ink-950 px-5 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-accent-600"
              type="button"
              onClick={onRetry}
            >
              {retryLabel}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  )
}
