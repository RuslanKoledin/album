import type {
  LayoutSpec,
  ProductSpec,
  TemplateSpec,
  TextSizeToken,
  ThemeSpec,
} from './bookConfiguration'
import type { OpaqueId, PhysicalSizeMm, TextRole } from '@core/book/model'

const containsId = (ids: readonly OpaqueId[], id: OpaqueId) =>
  ids.some((candidate) => candidate === id)

const hasSameSize = (first: PhysicalSizeMm, second: PhysicalSizeMm) =>
  first.width === second.width && first.height === second.height

export const isSpreadCountAllowed = (
  product: ProductSpec,
  spreadCount: number,
) =>
  Number.isInteger(spreadCount) &&
  spreadCount >= product.spreadCount.min &&
  spreadCount <= product.spreadCount.max

export const isLayoutCompatibleWithProduct = (
  product: ProductSpec,
  layout: LayoutSpec,
) => {
  const expectedSize =
    layout.surface === 'cover' ? product.coverSizeMm : product.spreadSizeMm

  return (
    containsId(product.allowedLayoutIds, layout.id) &&
    containsId(layout.supportedProductSpecIds, product.id) &&
    hasSameSize(expectedSize, layout.sizeMm)
  )
}

export const isThemeCompatibleWithProduct = (
  product: ProductSpec,
  theme: ThemeSpec,
) =>
  containsId(product.allowedThemeIds, theme.id) &&
  containsId(theme.supportedProductSpecIds, product.id)

export const isTextStyleAllowed = (
  product: ProductSpec,
  theme: ThemeSpec,
  textStyleId: OpaqueId,
  role: TextRole,
) => {
  const textStyle = theme.textStyles.find(({ id }) => id === textStyleId)

  if (!textStyle || textStyle.role !== role) {
    return false
  }

  return (
    isThemeCompatibleWithProduct(product, theme) &&
    product.allowedTextRoles.some((allowedRole) => allowedRole === role) &&
    product.allowedTextSizeTokens.some(
      (sizeToken: TextSizeToken) => sizeToken === textStyle.sizeToken,
    )
  )
}

export const isLayoutCompatibleWithTheme = (
  product: ProductSpec,
  theme: ThemeSpec,
  layout: LayoutSpec,
) =>
  layout.textSlots.every((textSlot) => {
    const textStyle = theme.textStyles.find(
      ({ id }) => id === textSlot.defaultTextStyleId,
    )

    return Boolean(
      textStyle &&
      textSlot.allowedRoles.some((role) => role === textStyle.role) &&
      isTextStyleAllowed(product, theme, textStyle.id, textStyle.role),
    )
  })

interface TemplateCompatibilityInput {
  readonly product: ProductSpec
  readonly theme: ThemeSpec
  readonly template: TemplateSpec
  readonly layouts: readonly LayoutSpec[]
}

export const isTemplateCompatibleWithProduct = ({
  product,
  theme,
  template,
  layouts,
}: TemplateCompatibilityInput) => {
  if (
    !containsId(product.allowedTemplateIds, template.id) ||
    !containsId(template.supportedProductSpecIds, product.id) ||
    template.themeId !== theme.id ||
    !isThemeCompatibleWithProduct(product, theme) ||
    !isSpreadCountAllowed(product, template.initialSpreadLayoutIds.length)
  ) {
    return false
  }

  const coverLayout = layouts.find(({ id }) => id === template.coverLayoutId)

  if (
    !coverLayout ||
    coverLayout.surface !== 'cover' ||
    !isLayoutCompatibleWithProduct(product, coverLayout) ||
    !isLayoutCompatibleWithTheme(product, theme, coverLayout)
  ) {
    return false
  }

  return template.initialSpreadLayoutIds.every((layoutId) => {
    const layout = layouts.find(({ id }) => id === layoutId)

    return Boolean(
      layout &&
      layout.surface === 'spread' &&
      isLayoutCompatibleWithProduct(product, layout) &&
      isLayoutCompatibleWithTheme(product, theme, layout),
    )
  })
}
