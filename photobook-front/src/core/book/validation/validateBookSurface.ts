import {
  isLayoutCompatibleWithProduct,
  type LayoutSpec,
  type ProductSpec,
  type ThemeSpec,
} from '@core/book/configuration'
import type { BookSurface } from '@core/book/model'

import type { BookDocumentValidationIssue } from './bookDocumentValidation'
import {
  validatePhotoSlots,
  validatePhotoSlotValues,
} from './validatePhotoSlots'
import { validateTextBlocks } from './validateTextBlocks'
import { hasSameSize } from './validationGeometry'

interface BookSurfaceValidationInput {
  readonly surface: BookSurface
  readonly path: string
  readonly expectedSurface: LayoutSpec['surface']
  readonly layouts: readonly LayoutSpec[]
  readonly assets: ReadonlySet<string>
  readonly product: ProductSpec | undefined
  readonly theme: ThemeSpec | undefined
  readonly issues: BookDocumentValidationIssue[]
}

export const validateBookSurface = ({
  surface,
  path,
  expectedSurface,
  layouts,
  assets,
  product,
  theme,
  issues,
}: BookSurfaceValidationInput) => {
  const layout = layouts.find(({ id }) => id === surface.layoutId)

  validatePhotoSlotValues({ surface, path, assets, issues })

  if (!layout) {
    issues.push({
      code: 'unknown_layout',
      path: `${path}/layoutId`,
      relatedId: surface.layoutId,
    })
    return
  }

  if (layout.surface !== expectedSurface) {
    issues.push({ code: 'layout_incompatible', path: `${path}/layoutId` })
  }
  if (!hasSameSize(surface.sizeMm, layout.sizeMm)) {
    issues.push({ code: 'layout_geometry_mismatch', path: `${path}/sizeMm` })
  }
  if (product && !isLayoutCompatibleWithProduct(product, layout)) {
    issues.push({ code: 'layout_incompatible', path: `${path}/layoutId` })
  }

  validatePhotoSlots({ surface, layout, path, issues })
  validateTextBlocks({ surface, layout, path, product, theme, issues })
}
