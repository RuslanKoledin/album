import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  getCompatibleSpreadLayouts,
  isLayoutCompatibleWithProduct,
  isSpreadCountAllowed,
  isTemplateCompatibleWithProduct,
  isTextStyleAllowed,
  isThemeCompatibleWithProduct,
  type LayoutSpec,
  type ProductSpec,
} from './index'
import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'

const sharedMockConfiguration = JSON.parse(
  readFileSync(
    resolve('docs/api/fixtures/catalog/v1/valid/mock-book-config-bundle.json'),
    'utf8',
  ),
) as unknown

describe('book configuration', () => {
  it('creates one deterministic mock product, theme, template and three layouts', () => {
    const first = createMockBookConfigurationBundle()
    const second = createMockBookConfigurationBundle()

    expect(first).toEqual(second)
    expect(first).toEqual(sharedMockConfiguration)
    expect(first).not.toBe(second)
    expect(first.catalogVersion).toBe('mock-catalog-v0')
    expect(first.productSpecs).toHaveLength(1)
    expect(first.themeSpecs).toHaveLength(1)
    expect(first.templateSpecs).toHaveLength(1)
    expect(first.layoutSpecs).toHaveLength(3)
    expect(first.productSpecs[0]?.productionStatus).toBe('mock')
    expect(
      [...first.layoutSpecs, ...first.themeSpecs, ...first.templateSpecs].every(
        ({ productionStatus }) => productionStatus === 'mock',
      ),
    ).toBe(true)
    expect(JSON.parse(JSON.stringify(first))).toEqual(first)
  })

  it('keeps the P1.1 document references resolvable in the configuration bundle', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const bundle = createMockBookConfigurationBundle()
    const product = bundle.productSpecs[0]

    expect(product?.id).toBe(document.productSelection.productSpecId)
    expect(product?.productId).toBe(document.productSelection.productId)
    expect(bundle.catalogVersion).toBe(document.productSelection.catalogVersion)
    expect(bundle.themeSpecs[0]?.id).toBe(document.productSelection.themeId)
    expect(bundle.templateSpecs[0]?.id).toBe(
      document.productSelection.templateId,
    )
    expect(bundle.layoutSpecs.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        document.cover.layoutId,
        document.spreads[0]?.layoutId,
      ]),
    )
    expect(
      document.productSelection.optionSelections.every((selection) =>
        product?.optionSpecs.some(
          (option) =>
            option.id === selection.optionId &&
            option.valueIds.some((valueId) => valueId === selection.valueId),
        ),
      ),
    ).toBe(true)
  })

  it('defines compatibility without using recommendation categories as restrictions', () => {
    const bundle = createMockBookConfigurationBundle()
    const product = bundle.productSpecs[0]
    const theme = bundle.themeSpecs[0]
    const template = bundle.templateSpecs[0]

    expect(product).toBeDefined()
    expect(theme).toBeDefined()
    expect(template).toBeDefined()

    if (!product || !theme || !template) {
      throw new Error('The mock configuration bundle is incomplete')
    }

    expect(
      bundle.layoutSpecs.every((layout) =>
        isLayoutCompatibleWithProduct(product, layout),
      ),
    ).toBe(true)
    expect(isThemeCompatibleWithProduct(product, theme)).toBe(true)
    expect(
      isTemplateCompatibleWithProduct({
        product,
        theme,
        template: { ...template, categoryTags: ['unrelated-category'] },
        layouts: bundle.layoutSpecs,
      }),
    ).toBe(true)
  })

  it('rejects configurations that target another product or wrong geometry', () => {
    const bundle = createMockBookConfigurationBundle()
    const product = bundle.productSpecs[0]
    const layout = bundle.layoutSpecs[0]

    expect(product).toBeDefined()
    expect(layout).toBeDefined()

    if (!product || !layout) {
      throw new Error('The mock configuration bundle is incomplete')
    }

    const anotherProduct: ProductSpec = {
      ...product,
      id: 'mock-another-product-spec',
    }
    const wrongSizeLayout: LayoutSpec = {
      ...layout,
      sizeMm: { width: layout.sizeMm.width + 1, height: layout.sizeMm.height },
    }

    expect(isLayoutCompatibleWithProduct(anotherProduct, layout)).toBe(false)
    expect(isLayoutCompatibleWithProduct(product, wrongSizeLayout)).toBe(false)
  })

  it('rejects a template when a layout default text style is unavailable', () => {
    const bundle = createMockBookConfigurationBundle()
    const product = bundle.productSpecs[0]
    const theme = bundle.themeSpecs[0]
    const template = bundle.templateSpecs[0]

    expect(product).toBeDefined()
    expect(theme).toBeDefined()
    expect(template).toBeDefined()

    if (!product || !theme || !template) {
      throw new Error('The mock configuration bundle is incomplete')
    }

    expect(
      isTemplateCompatibleWithProduct({
        product,
        theme: { ...theme, textStyles: [] },
        template,
        layouts: bundle.layoutSpecs,
      }),
    ).toBe(false)
  })

  it('limits spread counts, text roles and text sizes through product and theme specs', () => {
    const bundle = createMockBookConfigurationBundle()
    const product = bundle.productSpecs[0]
    const theme = bundle.themeSpecs[0]

    expect(product).toBeDefined()
    expect(theme).toBeDefined()

    if (!product || !theme) {
      throw new Error('The mock configuration bundle is incomplete')
    }

    expect(isSpreadCountAllowed(product, product.spreadCount.min)).toBe(true)
    expect(isSpreadCountAllowed(product, product.spreadCount.max)).toBe(true)
    expect(isSpreadCountAllowed(product, product.spreadCount.min - 1)).toBe(
      false,
    )
    expect(isSpreadCountAllowed(product, product.spreadCount.max + 1)).toBe(
      false,
    )

    expect(
      isTextStyleAllowed(product, theme, 'mock-title-style-v0', 'title'),
    ).toBe(true)
    expect(
      isTextStyleAllowed(product, theme, 'mock-title-style-v0', 'caption'),
    ).toBe(false)
    expect(isTextStyleAllowed(product, theme, 'unknown-style', 'title')).toBe(
      false,
    )
  })

  it('returns only compatible spread layouts for the requested photo count', () => {
    const bundle = createMockBookConfigurationBundle()
    const product = bundle.productSpecs[0]
    const theme = bundle.themeSpecs[0]

    expect(product).toBeDefined()
    expect(theme).toBeDefined()
    if (!product || !theme) return

    const layouts = getCompatibleSpreadLayouts({
      layouts: bundle.layoutSpecs,
      product,
      theme,
      photoCount: 1,
    })

    expect(layouts).toHaveLength(2)
    expect(layouts.every(({ surface }) => surface === 'spread')).toBe(true)
    expect(
      getCompatibleSpreadLayouts({
        layouts: bundle.layoutSpecs,
        product,
        theme,
        photoCount: 2,
      }),
    ).toEqual([])
  })
})
