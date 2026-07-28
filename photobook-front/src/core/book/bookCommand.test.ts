import { describe, expect, it } from 'vitest'

import {
  applyBookCommand,
  type ApplyBookCommandResult,
  type BookCommand,
  type BookDocumentV1,
  type Spread,
} from './index'
import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'

const configuration = createMockBookConfigurationBundle()

const apply = (document: BookDocumentV1, command: BookCommand) =>
  applyBookCommand(document, command, configuration)

const getDocument = (result: ApplyBookCommandResult) => {
  expect(result.ok).toBe(true)

  if (!result.ok) {
    throw new Error(`Book command failed: ${result.error.code}`)
  }

  return result.document
}

const createCaptionSpread = (): Spread => ({
  id: 'mock-spread-caption',
  layoutId: 'mock-spread-layout-photo-caption-v0',
  sizeMm: { width: 400, height: 200 },
  photoSlots: [
    {
      id: 'mock-spread-caption-photo',
      layoutSlotKey: 'main-photo',
      frameMm: { x: 10, y: 10, width: 260, height: 180 },
      assetId: 'mock-asset-spread-01',
      crop: { x: 0, y: 0, width: 1, height: 1 },
      focalPoint: { x: 0.5, y: 0.5 },
    },
  ],
  textBlocks: [
    {
      id: 'mock-spread-caption-text',
      layoutSlotKey: 'caption',
      frameMm: { x: 285, y: 40, width: 95, height: 100 },
      role: 'caption',
      textStyleId: 'mock-caption-style-v0',
      text: 'Летний день',
    },
  ],
})

describe('BookCommand', () => {
  it('updates title, product option and theme through catalog-backed commands', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const withTitle = getDocument(
      apply(initial, { type: 'set_book_title', title: 'Новая история' }),
    )
    const withCoverOption = getDocument(
      apply(withTitle, {
        type: 'set_cover_option',
        optionId: 'mock-cover-material',
        valueId: 'mock-cover-material-linen',
      }),
    )
    const withTheme = getDocument(
      apply(withCoverOption, {
        type: 'set_theme_option',
        themeId: 'mock-warm-editorial-v0',
      }),
    )

    expect(withTheme.metadata.title).toBe('Новая история')
    expect(withTheme.productSelection.optionSelections).toEqual([
      {
        optionId: 'mock-cover-material',
        valueId: 'mock-cover-material-linen',
      },
    ])
    expect(withTheme.productSelection.themeId).toBe('mock-warm-editorial-v0')
    expect(initial.metadata.title).toBe('Семейная история')
  })

  it('rejects a theme or cover option that the selected product does not allow', () => {
    const document = createMinimalBookDocumentV1Fixture()

    expect(
      apply(document, {
        type: 'set_cover_option',
        optionId: 'mock-cover-material',
        valueId: 'unknown-value',
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'document_invalid', commandType: 'set_cover_option' },
    })
    expect(
      apply(document, {
        type: 'set_theme_option',
        themeId: 'unknown-theme',
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'document_invalid', commandType: 'set_theme_option' },
    })
  })

  it('replaces a spread layout only with geometry allowed by its LayoutSpec', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const spread = createCaptionSpread()
    const result = apply(document, {
      type: 'set_spread_layout',
      spreadId: 'mock-spread-01',
      layoutId: spread.layoutId,
      photoSlots: spread.photoSlots,
      textBlocks: spread.textBlocks,
    })

    expect(getDocument(result).spreads[0]).toEqual({
      ...spread,
      id: 'mock-spread-01',
    })

    const invalidPhotoSlot = spread.photoSlots[0]

    expect(invalidPhotoSlot).toBeDefined()

    if (!invalidPhotoSlot) {
      throw new Error('The caption fixture has no photo slot')
    }

    expect(
      apply(document, {
        type: 'set_spread_layout',
        spreadId: 'mock-spread-01',
        layoutId: spread.layoutId,
        photoSlots: [
          {
            ...invalidPhotoSlot,
            frameMm: { ...invalidPhotoSlot.frameMm, width: 259 },
          },
        ],
        textBlocks: spread.textBlocks,
      }),
    ).toMatchObject({
      ok: false,
      error: { code: 'document_invalid' },
    })
  })

  it('assigns, crops, focuses and swaps photos without mutating the input', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const initialSpread = initial.spreads[0]
    const initialSpreadPhoto = initialSpread?.photoSlots[0]
    const initialCoverPhoto = initial.cover.photoSlots[0]

    expect(initialSpread).toBeDefined()
    expect(initialSpreadPhoto).toBeDefined()
    expect(initialCoverPhoto).toBeDefined()

    if (!initialSpread || !initialSpreadPhoto || !initialCoverPhoto) {
      throw new Error('The minimal fixture has incomplete photo content')
    }

    const withoutSpreadPhoto: BookDocumentV1 = {
      ...initial,
      spreads: [
        {
          ...initialSpread,
          photoSlots: [{ ...initialSpreadPhoto, assetId: null }],
        },
      ],
    }
    const assigned = getDocument(
      apply(withoutSpreadPhoto, {
        type: 'assign_photo',
        photoSlotId: initialSpreadPhoto.id,
        assetId: 'mock-asset-cover',
      }),
    )
    const cropped = getDocument(
      apply(assigned, {
        type: 'set_photo_crop',
        photoSlotId: initialSpreadPhoto.id,
        crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
      }),
    )
    const focused = getDocument(
      apply(cropped, {
        type: 'set_photo_focal_point',
        photoSlotId: initialSpreadPhoto.id,
        focalPoint: { x: 0.25, y: 0.75 },
      }),
    )
    const swapped = getDocument(
      apply(focused, {
        type: 'swap_photos',
        firstPhotoSlotId: initialCoverPhoto.id,
        secondPhotoSlotId: initialSpreadPhoto.id,
      }),
    )
    const swappedCover = swapped.cover.photoSlots[0]
    const swappedSpread = swapped.spreads[0]?.photoSlots[0]

    expect(swappedCover).toMatchObject({
      assetId: 'mock-asset-cover',
      crop: { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
      focalPoint: { x: 0.25, y: 0.75 },
    })
    expect(swappedSpread).toMatchObject({
      assetId: 'mock-asset-cover',
      crop: initialCoverPhoto.crop,
      focalPoint: initialCoverPhoto.focalPoint,
    })
    expect(initial.spreads[0]?.photoSlots[0]).toEqual(initialSpreadPhoto)
  })

  it('keeps an incomplete draft editable and reports missing required content', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const requiredPhotoId = initial.spreads[0]?.photoSlots[0]?.id

    expect(requiredPhotoId).toBeDefined()

    if (!requiredPhotoId) {
      throw new Error('The minimal fixture has no required photo')
    }

    const withoutRequiredPhoto = apply(initial, {
      type: 'remove_photo',
      photoSlotId: requiredPhotoId,
    })

    expect(withoutRequiredPhoto).toMatchObject({
      ok: true,
      issues: [{ code: 'required_photo_missing' }],
    })

    const captionSpread = createCaptionSpread()
    const withCaptionSpread = getDocument(
      apply(initial, { type: 'add_spread', spread: captionSpread }),
    )
    const withoutCaption = getDocument(
      apply(withCaptionSpread, {
        type: 'remove_text',
        textBlockId: 'mock-spread-caption-text',
      }),
    )

    expect(withoutCaption.spreads[1]?.textBlocks).toEqual([
      expect.objectContaining({
        id: 'mock-spread-caption-text',
        text: '',
      }),
    ])
  })

  it('sets text and reports a typed target error for an unknown entity', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const textBlockId = document.cover.textBlocks[0]?.id

    expect(textBlockId).toBeDefined()

    if (!textBlockId) {
      throw new Error('The minimal fixture has no cover text')
    }

    expect(
      getDocument(
        apply(document, {
          type: 'set_text',
          textBlockId,
          text: 'Кыргызстан, 2026',
        }),
      ).cover.textBlocks[0]?.text,
    ).toBe('Кыргызстан, 2026')
    expect(
      apply(document, {
        type: 'set_text',
        textBlockId: 'unknown-text-block',
        text: 'Не найдено',
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'target_not_found',
        commandType: 'set_text',
        targetId: 'unknown-text-block',
      },
    })
  })

  it('adds, reorders and removes spreads within ProductSpec limits', () => {
    const initial = createMinimalBookDocumentV1Fixture()
    const added = getDocument(
      apply(initial, { type: 'add_spread', spread: createCaptionSpread() }),
    )
    const reordered = getDocument(
      apply(added, {
        type: 'reorder_spread',
        spreadId: 'mock-spread-caption',
        toIndex: 0,
      }),
    )
    const removed = getDocument(
      apply(reordered, {
        type: 'remove_spread',
        spreadId: 'mock-spread-caption',
      }),
    )

    expect(added.spreads.map(({ id }) => id)).toEqual([
      'mock-spread-01',
      'mock-spread-caption',
    ])
    expect(reordered.spreads.map(({ id }) => id)).toEqual([
      'mock-spread-caption',
      'mock-spread-01',
    ])
    expect(removed.spreads.map(({ id }) => id)).toEqual(['mock-spread-01'])
    expect(initial.spreads.map(({ id }) => id)).toEqual(['mock-spread-01'])
  })

  it('rejects invalid indexes and leaves the original document unchanged', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const before = JSON.stringify(document)

    expect(
      apply(document, {
        type: 'reorder_spread',
        spreadId: 'mock-spread-01',
        toIndex: 2,
      }),
    ).toEqual({
      ok: false,
      error: {
        code: 'invalid_command',
        commandType: 'reorder_spread',
        message: 'toIndex must reference an existing spread position',
      },
    })
    expect(JSON.stringify(document)).toBe(before)
  })
})
