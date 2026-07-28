import {
  isSpreadCountAllowed,
  isTemplateCompatibleWithProduct,
  isThemeCompatibleWithProduct,
  type BookConfigurationBundle,
} from '@core/book/configuration'
import type { BookDocumentV1 } from '@core/book/model'

import type {
  BookDocumentValidationIssue,
  BookDocumentValidationResult,
} from './bookDocumentValidation'
import { validateBookSurface } from './validateBookSurface'
import { validateUniqueBookIds } from './validateUniqueBookIds'

export const validateBookDocumentV1 = (
  document: BookDocumentV1,
  configuration: BookConfigurationBundle,
): BookDocumentValidationResult => {
  const issues: BookDocumentValidationIssue[] = []
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

  validateUniqueBookIds(document, issues)

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
    if (!isSpreadCountAllowed(product, document.spreads.length)) {
      issues.push({ code: 'spread_count_out_of_range', path: '/spreads' })
    }
    selection.optionSelections.forEach((option, index) => {
      const optionSpec = product.optionSpecs.find(
        ({ id }) => id === option.optionId,
      )

      if (
        !optionSpec ||
        !optionSpec.valueIds.some((valueId) => valueId === option.valueId)
      ) {
        issues.push({
          code: 'product_option_invalid',
          path: `/productSelection/optionSelections/${index}`,
        })
      }
    })
  }

  if (!theme) {
    issues.push({
      code: 'unknown_theme',
      path: '/productSelection/themeId',
      relatedId: selection.themeId,
    })
  } else if (product && !isThemeCompatibleWithProduct(product, theme)) {
    issues.push({ code: 'unknown_theme', path: '/productSelection/themeId' })
  }

  if (!template) {
    issues.push({
      code: 'unknown_template',
      path: '/productSelection/templateId',
      relatedId: selection.templateId,
    })
  } else if (
    product &&
    theme &&
    !isTemplateCompatibleWithProduct({
      product,
      theme,
      template,
      layouts: configuration.layoutSpecs,
    })
  ) {
    issues.push({
      code: 'unknown_template',
      path: '/productSelection/templateId',
    })
  }

  const assetIds = new Set(document.assets.map(({ assetId }) => assetId))
  validateBookSurface({
    surface: document.cover,
    path: '/cover',
    expectedSurface: 'cover',
    layouts: configuration.layoutSpecs,
    assets: assetIds,
    product,
    theme,
    issues,
  })
  document.spreads.forEach((spread, index) =>
    validateBookSurface({
      surface: spread,
      path: `/spreads/${index}`,
      expectedSurface: 'spread',
      layouts: configuration.layoutSpecs,
      assets: assetIds,
      product,
      theme,
      issues,
    }),
  )

  return { isValid: issues.length === 0, issues }
}
