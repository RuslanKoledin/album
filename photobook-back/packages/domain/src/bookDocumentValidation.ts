import { validateBookSurface } from './bookSurfaceValidation.js'
import type {
  BookConfiguration,
  BookDocument,
  BookValidationIssue,
  BookValidationResult,
} from './bookValidation.types.js'

function validateUniqueIds(
  document: BookDocument,
  issues: BookValidationIssue[],
) {
  const seen = new Set<string>()
  const register = (id: string, path: string) => {
    if (seen.has(id)) {
      issues.push({ code: 'duplicate_id', path, relatedId: id })
    }
    seen.add(id)
  }
  document.assets.forEach(({ assetId }, index) =>
    register(assetId, `/assets/${index}/assetId`),
  )
  const registerSurface = (surface: BookDocument['cover'], path: string) => {
    surface.photoSlots.forEach(({ id }, index) =>
      register(id, `${path}/photoSlots/${index}/id`),
    )
    surface.textBlocks.forEach(({ id }, index) =>
      register(id, `${path}/textBlocks/${index}/id`),
    )
  }
  registerSurface(document.cover, '/cover')
  document.spreads.forEach((spread, index) => {
    register(spread.id, `/spreads/${index}/id`)
    registerSurface(spread, `/spreads/${index}`)
  })
}

export function validateBookDocument(
  document: BookDocument,
  configuration: BookConfiguration,
): BookValidationResult {
  const issues: BookValidationIssue[] = []
  const selection = document.productSelection
  const product = configuration.productSpecs.find(
    ({ id }) => id === selection.productSpecId,
  )
  const theme = configuration.themeSpecs.find(
    ({ id }) => id === selection.themeId,
  )
  const template = configuration.templateSpecs.find(
    ({ id }) => id === selection.templateId,
  )
  validateUniqueIds(document, issues)

  if (selection.catalogVersion !== configuration.catalogVersion) {
    issues.push({
      code: 'catalog_version_mismatch',
      path: '/productSelection/catalogVersion',
    })
  }
  if (!product) {
    issues.push({
      code: 'unknown_product_spec',
      path: '/productSelection/productSpecId',
      relatedId: selection.productSpecId,
    })
  } else {
    if (selection.productId !== product.productId) {
      issues.push({
        code: 'product_mismatch',
        path: '/productSelection/productId',
      })
    }
    if (
      document.spreads.length < product.spreadCount.min ||
      document.spreads.length > product.spreadCount.max
    ) {
      issues.push({ code: 'spread_count_out_of_range', path: '/spreads' })
    }
    selection.optionSelections.forEach((option, index) => {
      const spec = product.optionSpecs.find(({ id }) => id === option.optionId)
      if (!spec?.valueIds.includes(option.valueId)) {
        issues.push({
          code: 'product_option_invalid',
          path: `/productSelection/optionSelections/${index}`,
        })
      }
    })
  }
  if (
    !theme ||
    !product?.allowedThemeIds.includes(theme.id) ||
    !theme.supportedProductSpecIds.includes(product.id)
  ) {
    issues.push({
      code: 'unknown_theme',
      path: '/productSelection/themeId',
      relatedId: selection.themeId,
    })
  }
  if (
    !template ||
    template.themeId !== theme?.id ||
    !product?.allowedTemplateIds.includes(template.id) ||
    !template.supportedProductSpecIds.includes(product.id)
  ) {
    issues.push({
      code: 'unknown_template',
      path: '/productSelection/templateId',
      relatedId: selection.templateId,
    })
  }

  const assetIds = new Set(document.assets.map(({ assetId }) => assetId))
  validateBookSurface({
    assetIds,
    expectedSurface: 'cover',
    issues,
    layouts: configuration.layoutSpecs,
    path: '/cover',
    product,
    surface: document.cover,
    theme,
  })
  document.spreads.forEach((surface, index) =>
    validateBookSurface({
      assetIds,
      expectedSurface: 'spread',
      issues,
      layouts: configuration.layoutSpecs,
      path: `/spreads/${index}`,
      product,
      surface,
      theme,
    }),
  )

  return { isValid: issues.length === 0, issues }
}
