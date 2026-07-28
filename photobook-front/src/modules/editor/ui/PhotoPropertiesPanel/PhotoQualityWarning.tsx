import { MOCK_MIN_PRINT_DPI } from '@editor/libs'

interface PhotoQualityWarningProps {
  readonly effectiveDpi: number
}

export function PhotoQualityWarning({
  effectiveDpi,
}: PhotoQualityWarningProps) {
  return (
    <div
      aria-label="Качество выбранной фотографии"
      className="mt-4 rounded-xl border border-warning bg-warning-soft p-4 text-warning"
      role="status"
    >
      <p className="text-sm font-semibold">Низкое разрешение</p>
      <p className="mt-1 text-xs leading-5">
        При печати фото может быть менее чётким. Можно оставить его или выбрать
        другое.
      </p>
      <p className="mt-2 text-[0.6875rem] font-medium">
        Около {effectiveDpi} DPI · рекомендуем не ниже {MOCK_MIN_PRINT_DPI}
      </p>
    </div>
  )
}
