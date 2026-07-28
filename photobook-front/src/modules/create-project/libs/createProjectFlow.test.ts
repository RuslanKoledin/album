import { describe, expect, it } from 'vitest'

import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'
import {
  createUploadedPhotoDocument,
  getCreatePhotoReturnTo,
  getCreatePriceEstimate,
  getCreateProjectRequest,
  getCreateProjectSelection,
} from './index'

describe('create project flow', () => {
  const catalog = createMockBookConfigurationBundle()

  it('recovers invalid URL state to the first incomplete step', () => {
    const selection = getCreateProjectSelection(
      new URLSearchParams('step=details&product=unknown&spreads=999'),
      catalog,
    )

    expect(selection.step).toBe('product')
    expect(selection.productSpec).toBeNull()
    expect(selection.spreadCount).toBeNull()
  })

  it('keeps valid categories independent from template compatibility', () => {
    const selection = getCreateProjectSelection(
      new URLSearchParams(
        'step=details&product=mock-standard-hardcover-200x200-v0&template=mock-warm-family-story-v0&category=wedding&category=travel',
      ),
      catalog,
    )

    expect(selection.step).toBe('details')
    expect(selection.categoryTags).toEqual(['wedding', 'travel'])
    expect(selection.template?.id).toBe('mock-warm-family-story-v0')
  })

  it('selects the only available product and template as safe defaults', () => {
    const selection = getCreateProjectSelection(
      new URLSearchParams('step=product'),
      catalog,
    )

    expect(selection.productSpec?.id).toBe('mock-standard-hardcover-200x200-v0')
    expect(selection.template?.id).toBe('mock-warm-family-story-v0')
    expect(selection.spreadCount).toBe(1)
  })

  it('maps a price quote to the create-flow presentation', () => {
    const estimate = getCreatePriceEstimate({
      quoteId: 'mock-price-quote-01',
      expiresAt: '2026-07-22T09:15:00Z',
      items: [],
      total: { amountMinor: 440_000, currency: 'KGS' },
      estimatedReadyDate: null,
      priceStatus: 'provisional',
    })

    expect(estimate).toEqual({
      amountMinor: 440_000,
      currency: 'KGS',
      status: 'provisional',
    })
  })

  it('maps the complete URL selection to the frozen create contract', () => {
    const selection = getCreateProjectSelection(
      new URLSearchParams(
        'step=photos&product=mock-standard-hardcover-200x200-v0&template=mock-warm-family-story-v0&category=family&cover=mock-cover-material-linen&spreads=3&photos=seeded-family-demo-v0',
      ),
      catalog,
    )

    expect(selection.step).toBe('photos')
    expect(getCreateProjectRequest(selection, catalog.catalogVersion)).toEqual({
      productId: 'mock-standard-hardcover',
      templateId: 'mock-warm-family-story-v0',
      catalogVersion: 'mock-catalog-v0',
      categoryTags: ['family'],
      spreadCount: 3,
      optionSelections: [
        {
          optionId: 'mock-cover-material',
          valueId: 'mock-cover-material-linen',
        },
      ],
    })
  })

  it('preserves the current selection in the sign-in return URL', () => {
    expect(
      getCreatePhotoReturnTo(
        '/create',
        '?product=mock-product&template=mock-template',
      ),
    ).toBe('/create?product=mock-product&template=mock-template&step=photos')
  })

  it('recognizes a local-device photo source without serializing files', () => {
    const selection = getCreateProjectSelection(
      new URLSearchParams(
        'step=photos&product=mock-standard-hardcover-200x200-v0&template=mock-warm-family-story-v0&photos=local-device-v0',
      ),
      catalog,
    )

    expect(selection.photoSetId).toBe('local-device-v0')
    expect(selection.step).toBe('photos')
    const request = getCreateProjectRequest(selection, catalog.catalogVersion)
    expect(request).toMatchObject({
      productId: 'mock-standard-hardcover',
      templateId: 'mock-warm-family-story-v0',
      catalogVersion: 'mock-catalog-v0',
    })
    expect(request).not.toHaveProperty('files')
  })

  it('binds uploaded assets without carrying seeded slot assignments', () => {
    const source = createMinimalBookDocumentV1Fixture()
    const uploaded = createUploadedPhotoDocument(source, [
      'asset-uploaded-1',
      'asset-uploaded-2',
    ])

    expect(uploaded.assets).toEqual([
      { assetId: 'asset-uploaded-1' },
      { assetId: 'asset-uploaded-2' },
    ])
    const photoSlots = [
      ...uploaded.cover.photoSlots,
      ...uploaded.spreads.flatMap(({ photoSlots }) => photoSlots),
    ]

    expect(photoSlots.every(({ assetId }) => assetId === null)).toBe(true)
  })
})
