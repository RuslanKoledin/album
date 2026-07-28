import { FiCheck } from 'react-icons/fi'

import type { LayoutSpec, ThemeSpec } from '@core/book'

import { getLayoutOptionLabel } from '@editor/libs'

import { LayoutPreview } from './LayoutPreview'

interface LayoutOptionCardProps {
  readonly active: boolean
  readonly layout: LayoutSpec
  readonly onSelect: () => void
  readonly theme: ThemeSpec
}

export function LayoutOptionCard({
  active,
  layout,
  onSelect,
  theme,
}: LayoutOptionCardProps) {
  const label = getLayoutOptionLabel(layout)

  return (
    <button
      aria-label={active ? `${label}, выбран` : label}
      aria-pressed={active}
      className={`relative min-h-11 rounded-xl border p-2 text-left transition-colors ${
        active
          ? 'border-accent-600 bg-accent-50 ring-1 ring-accent-600'
          : 'border-border hover:border-control-border hover:bg-paper-50'
      }`}
      disabled={active}
      type="button"
      onClick={onSelect}
    >
      <LayoutPreview layout={layout} theme={theme} />
      <span className="mt-2 flex items-start gap-1 text-xs leading-4 font-medium">
        {active && (
          <FiCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-accent-700"
          />
        )}
        {label}
      </span>
    </button>
  )
}
