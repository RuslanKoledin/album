interface LayoutPhotoCountFilterProps {
  readonly counts: readonly number[]
  readonly value: number | null
  readonly onChange: (value: number | null) => void
}

export function LayoutPhotoCountFilter({
  counts,
  value,
  onChange,
}: LayoutPhotoCountFilterProps) {
  if (counts.length < 2) return null

  return (
    <div className="mt-4" role="group" aria-label="Количество фотографий">
      <p className="text-xs font-medium text-ink-700">Количество фото</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          aria-pressed={value === null}
          className="min-h-11 rounded-full border border-control-border px-3 text-xs font-medium aria-pressed:border-ink-950 aria-pressed:bg-ink-950 aria-pressed:text-surface"
          type="button"
          onClick={() => onChange(null)}
        >
          Все
        </button>
        {counts.map((count) => (
          <button
            aria-pressed={value === count}
            className="min-h-11 rounded-full border border-control-border px-3 text-xs font-medium aria-pressed:border-ink-950 aria-pressed:bg-ink-950 aria-pressed:text-surface"
            key={count}
            type="button"
            onClick={() => onChange(count)}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  )
}
