import { describe, expect, it } from 'vitest'

import {
  createMinimalBookDocumentV1Fixture,
  createMockBookConfigurationBundle,
} from '@mocks/book'

import { createLocalPreflightReport } from './createLocalPreflightReport'

const configuration = createMockBookConfigurationBundle()

describe('createLocalPreflightReport', () => {
  it('ties missing required content to the affected surface and element', () => {
    const source = createMinimalBookDocumentV1Fixture()
    const coverPhoto = source.cover.photoSlots[0]
    const coverText = source.cover.textBlocks[0]
    if (!coverPhoto || !coverText) throw new Error('Fixture is incomplete')

    const document = {
      ...source,
      cover: {
        ...source.cover,
        photoSlots: [{ ...coverPhoto, assetId: null }],
        textBlocks: [{ ...coverText, text: '' }],
      },
    }

    const report = createLocalPreflightReport({
      configuration,
      document,
      minPrintDpi: 240,
      resolvePhotoPixelSize: () => undefined,
    })

    expect(report.errorCount).toBe(2)
    expect(report.warningCount).toBe(0)
    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'required_photo_missing',
          elementId: coverPhoto.id,
          elementKind: 'photo',
          severity: 'error',
          surfaceId: 'cover',
        }),
        expect.objectContaining({
          code: 'required_text_missing',
          elementId: coverText.id,
          elementKind: 'text',
          severity: 'error',
          surfaceId: 'cover',
        }),
      ]),
    )
  })

  it('reports low resolution as a non-blocking warning', () => {
    const source = createMinimalBookDocumentV1Fixture()
    const spread = source.spreads[0]
    const photoSlot = spread?.photoSlots[0]
    if (!spread || !photoSlot) throw new Error('Fixture is incomplete')

    const document = {
      ...source,
      assets: [...source.assets, { assetId: 'low-resolution-asset' }],
      spreads: [
        {
          ...spread,
          photoSlots: [{ ...photoSlot, assetId: 'low-resolution-asset' }],
        },
      ],
    }

    const report = createLocalPreflightReport({
      configuration,
      document,
      minPrintDpi: 240,
      resolvePhotoPixelSize: (assetId) =>
        assetId === 'low-resolution-asset'
          ? { width: 900, height: 900 }
          : { width: 6_000, height: 4_000 },
    })

    expect(report.errorCount).toBe(0)
    expect(report.warningCount).toBe(1)
    expect(report.isReady).toBe(true)
    expect(report.issues[0]).toEqual(
      expect.objectContaining({
        code: 'photo_resolution_low',
        effectiveDpi: 57,
        elementId: photoSlot.id,
        elementKind: 'photo',
        severity: 'warning',
        surfaceId: spread.id,
      }),
    )
  })
})
