import type { LayoutSpec, ProductSpec, ThemeSpec } from './bookConfiguration'
import {
  isLayoutCompatibleWithProduct,
  isLayoutCompatibleWithTheme,
} from './compatibility'

interface GetCompatibleSpreadLayoutsInput {
  readonly layouts: readonly LayoutSpec[]
  readonly product: ProductSpec
  readonly theme: ThemeSpec
  readonly photoCount?: number
}

export const getCompatibleSpreadLayouts = ({
  layouts,
  product,
  theme,
  photoCount,
}: GetCompatibleSpreadLayoutsInput) =>
  layouts.filter(
    (layout) =>
      layout.surface === 'spread' &&
      isLayoutCompatibleWithProduct(product, layout) &&
      isLayoutCompatibleWithTheme(product, theme, layout) &&
      (photoCount === undefined || layout.photoSlots.length === photoCount),
  )
