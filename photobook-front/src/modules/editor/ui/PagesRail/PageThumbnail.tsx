import { FiAlertTriangle } from 'react-icons/fi'

import type { BookSurface, ThemeSpec } from '@core/book'

import { BookSurfaceRenderer } from '@editor-ui/BookSurfaceRenderer'

interface PageThumbnailProps {
  readonly active: boolean
  readonly label: string
  readonly onSelect: () => void
  readonly photoSources: Readonly<Record<string, string>>
  readonly surface: BookSurface
  readonly theme: ThemeSpec | undefined
  readonly warning: boolean
}

export function PageThumbnail({
  active,
  label,
  onSelect,
  photoSources,
  surface,
  theme,
  warning,
}: PageThumbnailProps) {
  return (
    <button
      aria-current={active ? 'page' : undefined}
      aria-label={`Открыть: ${label}${warning ? ', требуется проверить' : ''}`}
      className={`w-28 shrink-0 rounded-xl border bg-surface p-2 text-left transition-colors md:w-full ${
        active
          ? 'border-accent-600 ring-1 ring-accent-600'
          : 'border-border hover:border-control-border'
      }`}
      type="button"
      onClick={onSelect}
    >
      <span className="block overflow-hidden rounded-md bg-paper-100">
        <BookSurfaceRenderer
          compact
          photoSources={photoSources}
          surface={surface}
          theme={theme}
        />
      </span>
      <span className="mt-2 block text-center text-xs font-medium">
        {label}
      </span>
      {warning && (
        <span className="mt-1 flex items-center justify-center gap-1 text-[0.6875rem] font-medium text-warning">
          <FiAlertTriangle aria-hidden="true" />
          Проверьте
        </span>
      )}
    </button>
  )
}
