import type { PhotoFilter } from '@editor/model'

interface PhotoFilterTabsProps {
  readonly allCount: number
  readonly filter: PhotoFilter
  readonly unusedCount: number
  readonly usedCount: number
  readonly onChange: (filter: PhotoFilter) => void
}

const getFilterClassName = (active: boolean) =>
  `min-h-11 rounded-xl border px-2 text-xs font-semibold ${
    active
      ? 'border-accent-600 bg-accent-600 text-surface'
      : 'border-border bg-surface hover:bg-paper-100'
  }`

export function PhotoFilterTabs({
  allCount,
  filter,
  unusedCount,
  usedCount,
  onChange,
}: PhotoFilterTabsProps) {
  return (
    <div
      aria-label="Фильтр фотографий"
      className="mt-5 grid grid-cols-3 gap-2"
      role="group"
    >
      <button
        aria-pressed={filter === 'all'}
        className={getFilterClassName(filter === 'all')}
        type="button"
        onClick={() => onChange('all')}
      >
        Все {allCount}
      </button>
      <button
        aria-label={`Использованные ${usedCount}`}
        aria-pressed={filter === 'used'}
        className={getFilterClassName(filter === 'used')}
        type="button"
        onClick={() => onChange('used')}
      >
        В книге {usedCount}
      </button>
      <button
        aria-label={`Неиспользованные ${unusedCount}`}
        aria-pressed={filter === 'unused'}
        className={getFilterClassName(filter === 'unused')}
        type="button"
        onClick={() => onChange('unused')}
      >
        Свободные {unusedCount}
      </button>
    </div>
  )
}
