import type { PhotoSlotUsage } from '@editor/model'

interface PhotoSwapConfirmationProps {
  readonly target: PhotoSlotUsage
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export function PhotoSwapConfirmation({
  target,
  onCancel,
  onConfirm,
}: PhotoSwapConfirmationProps) {
  return (
    <section
      aria-labelledby="swap-title"
      className="mt-4 rounded-xl border border-warning bg-warning-soft p-4"
    >
      <h4 className="text-sm font-semibold text-ink-950" id="swap-title">
        Поменять фотографии местами?
      </h4>
      <p className="mt-1 text-xs leading-5 text-ink-700">
        Это фото уже стоит на {target.surfaceLabel}. Обе фотографии сохранят
        своё кадрирование.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="min-h-11 rounded-xl border border-control-border bg-surface px-3 text-sm font-medium"
          type="button"
          onClick={onCancel}
        >
          Отмена
        </button>
        <button
          className="min-h-11 rounded-xl bg-accent-600 px-3 text-sm font-semibold text-surface hover:bg-accent-700"
          type="button"
          onClick={onConfirm}
        >
          Поменять местами
        </button>
      </div>
    </section>
  )
}
