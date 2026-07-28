import { MAX_PHOTO_ZOOM, MIN_PHOTO_ZOOM } from '@editor/libs'

interface PhotoCropControlsProps {
  readonly zoom: number
  readonly onApply: () => void
  readonly onCancel: () => void
  readonly onChangeZoom: (zoom: number) => void
}

export function PhotoCropControls({
  zoom,
  onApply,
  onCancel,
  onChangeZoom,
}: PhotoCropControlsProps) {
  return (
    <section
      aria-labelledby="crop-panel-title"
      className="mt-5 rounded-xl bg-paper-50 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold" id="crop-panel-title">
          Кадрирование
        </h4>
        <output
          className="text-xs font-semibold text-accent-700"
          htmlFor="photo-zoom"
        >
          {Math.round(zoom * 100)}%
        </output>
      </div>
      <p className="mt-1 text-xs leading-5 text-ink-500">
        Масштаб изменяется вокруг выбранной важной области.
      </p>
      <label
        className="mt-4 block text-xs font-medium text-ink-700"
        htmlFor="photo-zoom"
      >
        Масштаб фотографии
      </label>
      <input
        className="mt-3 min-h-11 w-full accent-accent-600"
        id="photo-zoom"
        max={MAX_PHOTO_ZOOM}
        min={MIN_PHOTO_ZOOM}
        step="0.05"
        type="range"
        value={zoom}
        onChange={(event) => onChangeZoom(Number(event.target.value))}
      />
      <div className="mt-4 grid grid-cols-2 gap-2">
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
          onClick={onApply}
        >
          Применить кадрирование
        </button>
      </div>
    </section>
  )
}
