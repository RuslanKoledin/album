import { useState } from 'react'

import type { LayoutSpec, Spread, ThemeSpec } from '@core/book'

import { getLayoutPhotoCounts } from '@editor/libs'

import { LayoutOptionCard } from './LayoutOptionCard'
import { LayoutPhotoCountFilter } from './LayoutPhotoCountFilter'

interface LayoutPropertiesPanelProps {
  readonly activeSpread: Spread
  readonly commandError: string | null
  readonly layouts: readonly LayoutSpec[]
  readonly onApplyLayout: (layoutId: string) => void
  readonly theme: ThemeSpec
}

export function LayoutPropertiesPanel({
  activeSpread,
  commandError,
  layouts,
  onApplyLayout,
  theme,
}: LayoutPropertiesPanelProps) {
  const [photoCount, setPhotoCount] = useState<number | null>(null)
  const photoCounts = getLayoutPhotoCounts(layouts)
  const visibleLayouts = layouts.filter(
    (layout) => photoCount === null || layout.photoSlots.length === photoCount,
  )

  return (
    <div className="mt-5">
      <h3 className="font-semibold">Макет разворота</h3>
      <p className="mt-1 text-xs leading-5 text-ink-500">
        Выберите структуру страницы. Фотографии сохранятся, если для них есть
        место в новом макете.
      </p>
      <LayoutPhotoCountFilter
        counts={photoCounts}
        value={photoCount}
        onChange={setPhotoCount}
      />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {visibleLayouts.map((layout) => (
          <LayoutOptionCard
            active={activeSpread.layoutId === layout.id}
            key={layout.id}
            layout={layout}
            theme={theme}
            onSelect={() => onApplyLayout(layout.id)}
          />
        ))}
      </div>
      {commandError && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {commandError}
        </p>
      )}
    </div>
  )
}
