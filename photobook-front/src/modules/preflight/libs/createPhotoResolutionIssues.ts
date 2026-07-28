import { calculateEffectivePhotoDpi, type BookDocumentV1 } from '@core/book'

import type {
  LocalPreflightIssue,
  ResolvePhotoPixelSize,
} from '@preflight/model'

interface CreatePhotoResolutionIssuesInput {
  readonly document: BookDocumentV1
  readonly minPrintDpi: number
  readonly resolvePhotoPixelSize: ResolvePhotoPixelSize
}

export const createPhotoResolutionIssues = ({
  document,
  minPrintDpi,
  resolvePhotoPixelSize,
}: CreatePhotoResolutionIssuesInput): readonly LocalPreflightIssue[] => {
  const surfaces = [
    { id: 'cover', spreadIndex: null, surface: document.cover },
    ...document.spreads.map((surface, spreadIndex) => ({
      id: surface.id,
      spreadIndex,
      surface,
    })),
  ]

  return surfaces.flatMap(({ id, spreadIndex, surface }) =>
    surface.photoSlots.flatMap((photoSlot, photoIndex) => {
      if (!photoSlot.assetId) return []

      const pixelSize = resolvePhotoPixelSize(photoSlot.assetId)
      if (!pixelSize) return []

      const effectiveDpi = calculateEffectivePhotoDpi({
        crop: photoSlot.crop,
        frameMm: photoSlot.frameMm,
        pixelSize,
      })
      if (effectiveDpi >= minPrintDpi) return []

      return [
        {
          code: 'photo_resolution_low' as const,
          effectiveDpi,
          elementId: photoSlot.id,
          elementKind: 'photo' as const,
          id: `photo_resolution_low:${photoSlot.id}`,
          path:
            id === 'cover'
              ? `/cover/photoSlots/${photoIndex}/assetId`
              : `/spreads/${spreadIndex}/photoSlots/${photoIndex}/assetId`,
          severity: 'warning' as const,
          spreadIndex,
          surfaceId: id,
        },
      ]
    }),
  )
}
