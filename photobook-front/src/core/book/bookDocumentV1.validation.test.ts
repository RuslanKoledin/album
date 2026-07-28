import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  BOOK_DOCUMENT_MIGRATIONS,
  deserializeBookDocumentV1,
  serializeBookDocumentV1,
  validateBookDocumentV1,
  type BookDocumentV1,
} from './index'
import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'

const createValidationInput = () => ({
  document: createMinimalBookDocumentV1Fixture(),
  configuration: createMockBookConfigurationBundle(),
})

const getIssueCodes = (document: BookDocumentV1) =>
  validateBookDocumentV1(
    document,
    createMockBookConfigurationBundle(),
  ).issues.map(({ code }) => code)

describe('BookDocumentV1 validation', () => {
  it('accepts the minimal document against the mock configuration bundle', () => {
    const { document, configuration } = createValidationInput()

    expect(validateBookDocumentV1(document, configuration)).toEqual({
      isValid: true,
      issues: [],
    })
  })

  it('rejects duplicate IDs across document entities', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const duplicateAssetDocument: BookDocumentV1 = {
      ...document,
      assets: [
        ...document.assets,
        { assetId: document.assets[0]?.assetId ?? '' },
      ],
    }

    expect(getIssueCodes(duplicateAssetDocument)).toContain('duplicate_id')
  })

  it('rejects unknown layouts and slots that do not match the selected layout', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const spread = document.spreads[0]

    expect(spread).toBeDefined()

    if (!spread) {
      throw new Error('The minimal fixture has no spread')
    }

    const unknownLayoutDocument: BookDocumentV1 = {
      ...document,
      spreads: [{ ...spread, layoutId: 'unknown-layout' }],
    }
    const mismatchedSlotDocument: BookDocumentV1 = {
      ...document,
      spreads: [
        {
          ...spread,
          photoSlots: spread.photoSlots.map((slot) => ({
            ...slot,
            layoutSlotKey: 'unknown-slot',
          })),
        },
      ],
    }

    expect(getIssueCodes(unknownLayoutDocument)).toContain('unknown_layout')
    expect(getIssueCodes(mismatchedSlotDocument)).toContain(
      'layout_slot_mismatch',
    )
  })

  it('rejects a spread count outside ProductSpec limits', () => {
    const document = createMinimalBookDocumentV1Fixture()

    expect(getIssueCodes({ ...document, spreads: [] })).toContain(
      'spread_count_out_of_range',
    )
  })

  it('rejects unknown assets and empty required photo or text slots', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const coverPhoto = document.cover.photoSlots[0]
    const coverText = document.cover.textBlocks[0]

    expect(coverPhoto).toBeDefined()
    expect(coverText).toBeDefined()

    if (!coverPhoto || !coverText) {
      throw new Error('The minimal fixture has incomplete cover content')
    }

    const unknownAssetDocument: BookDocumentV1 = {
      ...document,
      cover: {
        ...document.cover,
        photoSlots: [{ ...coverPhoto, assetId: 'unknown-asset' }],
      },
    }
    const emptyRequiredSlotsDocument: BookDocumentV1 = {
      ...document,
      cover: {
        ...document.cover,
        photoSlots: [{ ...coverPhoto, assetId: null }],
        textBlocks: [{ ...coverText, text: '' }],
      },
    }

    expect(getIssueCodes(unknownAssetDocument)).toContain('unknown_asset')
    expect(getIssueCodes(emptyRequiredSlotsDocument)).toEqual(
      expect.arrayContaining([
        'required_photo_missing',
        'required_text_missing',
      ]),
    )
  })

  it('detects text that exceeds the configured slot limit', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const coverText = document.cover.textBlocks[0]

    expect(coverText).toBeDefined()
    if (!coverText) return

    const overflowingDocument: BookDocumentV1 = {
      ...document,
      cover: {
        ...document.cover,
        textBlocks: [{ ...coverText, text: 'А'.repeat(49) }],
      },
    }

    expect(getIssueCodes(overflowingDocument)).toContain('text_overflow')
  })

  it('rejects crop rectangles and focal points outside normalized bounds', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const spread = document.spreads[0]
    const photoSlot = spread?.photoSlots[0]

    expect(spread).toBeDefined()
    expect(photoSlot).toBeDefined()

    if (!spread || !photoSlot) {
      throw new Error('The minimal fixture has no photo slot')
    }

    const invalidDocument: BookDocumentV1 = {
      ...document,
      spreads: [
        {
          ...spread,
          photoSlots: [
            {
              ...photoSlot,
              crop: { x: 0.5, y: 0, width: 0.6, height: 1 },
              focalPoint: { x: 1.1, y: 0.5 },
            },
          ],
        },
      ],
    }

    expect(getIssueCodes(invalidDocument)).toEqual(
      expect.arrayContaining([
        'crop_out_of_bounds',
        'focal_point_out_of_bounds',
      ]),
    )
  })

  it('rejects document selections that do not resolve in the catalog', () => {
    const document = createMinimalBookDocumentV1Fixture()

    expect(
      getIssueCodes({
        ...document,
        productSelection: {
          ...document.productSelection,
          themeId: 'unknown-theme',
        },
      }),
    ).toContain('unknown_theme')
  })
})

describe('BookDocumentV1 persistence boundary', () => {
  it('serializes and deserializes v1 without losing data', () => {
    const { document, configuration } = createValidationInput()
    const serialized = serializeBookDocumentV1(document, configuration)

    expect(serialized.ok).toBe(true)

    if (!serialized.ok) {
      throw new Error('The valid fixture could not be serialized')
    }

    expect(deserializeBookDocumentV1(serialized.value, configuration)).toEqual({
      ok: true,
      value: document,
    })
  })

  it('does not serialize a document that violates domain invariants', () => {
    const { document, configuration } = createValidationInput()

    expect(
      serializeBookDocumentV1({ ...document, spreads: [] }, configuration),
    ).toMatchObject({
      ok: false,
      error: {
        code: 'invalid_document',
        issues: [{ code: 'spread_count_out_of_range' }],
      },
    })
  })

  it('rejects the shared domain-invalid crop fixture', () => {
    const serialized = readFileSync(
      resolve(
        'docs/api/fixtures/book-document/v1/invalid/domain/crop-rectangle-overflow.json',
      ),
      'utf8',
    )

    expect(
      deserializeBookDocumentV1(
        serialized,
        createMockBookConfigurationBundle(),
      ),
    ).toMatchObject({
      ok: false,
      error: {
        code: 'invalid_document',
        issues: [{ code: 'crop_out_of_bounds' }],
      },
    })
  })

  it.each([
    ['invalid_json', '{'],
    ['unsupported_schema_version', '{"schemaVersion":2}'],
    [
      'invalid_structure',
      JSON.stringify({
        ...createMinimalBookDocumentV1Fixture(),
        uiState: { selectedSpreadId: 'mock-spread-01' },
      }),
    ],
  ] as const)('returns %s for an invalid persisted value', (code, value) => {
    expect(
      deserializeBookDocumentV1(value, createMockBookConfigurationBundle()),
    ).toMatchObject({ ok: false, error: { code } })
  })

  it('defines the migration interface without fake migrations', () => {
    expect(BOOK_DOCUMENT_MIGRATIONS).toEqual([])
  })
})
