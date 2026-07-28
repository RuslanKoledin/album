import type { TextStyleSpec } from '@core/book'

import { getTextAlignLabel, getTextColorLabel } from '@editor/libs'

interface TextStyleSummaryProps {
  readonly style: TextStyleSpec
}

export function TextStyleSummary({ style }: TextStyleSummaryProps) {
  return (
    <div className="mt-5 rounded-xl bg-accent-50 p-4">
      <p className="text-xs font-semibold text-accent-700">Стиль макета</p>
      <p className="mt-1 text-xs leading-5 text-ink-700">
        {style.fontSizePt} pt · {getTextAlignLabel(style.textAlign)} ·{' '}
        {getTextColorLabel(style.colorToken)}
      </p>
      <p className="mt-2 text-xs leading-5 text-ink-500">
        Параметры ограничены выбранным макетом, чтобы результат оставался
        пригодным для печати.
      </p>
    </div>
  )
}
