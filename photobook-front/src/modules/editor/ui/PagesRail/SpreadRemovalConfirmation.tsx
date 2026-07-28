interface SpreadRemovalConfirmationProps {
  readonly label: string
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export function SpreadRemovalConfirmation({
  label,
  onCancel,
  onConfirm,
}: SpreadRemovalConfirmationProps) {
  return (
    <div
      className="mt-3 rounded-xl border border-warning bg-warning-soft p-3"
      role="alert"
    >
      <p className="text-xs font-semibold text-warning">
        Удалить {label.toLowerCase()}?
      </p>
      <p className="mt-1 text-xs leading-5 text-ink-700">
        Фотографии останутся в проекте. Действие можно отменить.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="min-h-11 rounded-lg border border-control-border bg-surface px-2 text-xs font-semibold"
          type="button"
          onClick={onCancel}
        >
          Не удалять
        </button>
        <button
          className="min-h-11 rounded-lg bg-danger px-2 text-xs font-semibold text-surface"
          type="button"
          onClick={onConfirm}
        >
          Удалить
        </button>
      </div>
    </div>
  )
}
