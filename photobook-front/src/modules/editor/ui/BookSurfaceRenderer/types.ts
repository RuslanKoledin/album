import type { BookSurface, ThemeSpec } from '@core/book'

import type { PhotoAdjustmentPreview } from '@editor/libs'

export interface BookSurfaceRendererProps {
  readonly compact?: boolean
  readonly onSelectElement?: (id: string, kind: 'photo' | 'text') => void
  readonly photoAdjustmentPreview?: PhotoAdjustmentPreview | null
  readonly photoSources?: Readonly<Record<string, string>>
  readonly selectedElementId?: string | null
  readonly surface: BookSurface
  readonly theme: ThemeSpec | undefined
}
