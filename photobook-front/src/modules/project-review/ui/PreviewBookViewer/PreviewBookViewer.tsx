import { useEffect, useState } from 'react'
import { LuExpand, LuX } from 'react-icons/lu'

import type { BookDocumentV1, ThemeSpec } from '@core/book'
import { BookSurfaceRenderer } from '@modules/editor'
import { getReviewSurfaces } from '@project-review/libs'

interface PreviewBookViewerProps {
  readonly document: BookDocumentV1
  readonly photoSources: Readonly<Record<string, string>>
  readonly theme: ThemeSpec | undefined
}

export function PreviewBookViewer({
  document,
  photoSources,
  theme,
}: PreviewBookViewerProps) {
  const surfaces = getReviewSurfaces(document)
  const [activeId, setActiveId] = useState('cover')
  const [fullscreen, setFullscreen] = useState(false)
  const active = surfaces.find(({ id }) => id === activeId) ?? surfaces[0]

  useEffect(() => {
    if (!fullscreen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [fullscreen])

  if (!active) return null

  return (
    <section
      aria-label="Предпросмотр книги"
      className={
        fullscreen
          ? 'fixed inset-0 z-50 flex min-w-0 flex-col bg-paper-100 p-4 sm:p-8'
          : 'min-w-0 rounded-4xl border border-border bg-surface p-4 shadow-surface sm:p-6'
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-accent-600 uppercase">
            Предпросмотр
          </p>
          <h2 className="mt-1 font-serif text-2xl">{active.label}</h2>
        </div>
        <button
          aria-label={
            fullscreen ? 'Закрыть полный экран' : 'Открыть на весь экран'
          }
          className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-surface transition-colors hover:bg-paper-100"
          type="button"
          onClick={() => setFullscreen((current) => !current)}
        >
          {fullscreen ? (
            <LuX aria-hidden="true" size={20} />
          ) : (
            <LuExpand aria-hidden="true" size={20} />
          )}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center py-6">
        <div
          className="w-full max-w-4xl overflow-hidden rounded-2xl bg-paper-200 shadow-book"
          style={{
            aspectRatio: `${active.surface.sizeMm.width} / ${active.surface.sizeMm.height}`,
          }}
        >
          <BookSurfaceRenderer
            compact
            photoSources={photoSources}
            surface={active.surface}
            theme={theme}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {surfaces.map(({ id, label, surface }) => (
          <button
            aria-label={`${label}, ${surface.sizeMm.width} на ${surface.sizeMm.height} миллиметров`}
            aria-selected={id === active.id}
            className="min-h-11 min-w-28 rounded-xl border px-4 text-sm font-semibold transition-colors aria-selected:border-ink-950 aria-selected:bg-ink-950 aria-selected:text-surface"
            key={id}
            role="tab"
            type="button"
            onClick={() => setActiveId(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-ink-500">
        Экран помогает проверить композицию. Это не печатный PDF и не передача
        цвета готового изделия.
      </p>
    </section>
  )
}
