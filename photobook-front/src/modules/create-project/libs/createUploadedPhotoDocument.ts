import type { BookDocumentV1, BookSurface } from '@core/book'

const clearSurfacePhotos = <TSurface extends BookSurface>(
  surface: TSurface,
) => ({
  ...surface,
  photoSlots: surface.photoSlots.map((slot) => ({ ...slot, assetId: null })),
})

export const createUploadedPhotoDocument = (
  document: BookDocumentV1,
  assetIds: readonly string[],
): BookDocumentV1 => ({
  ...document,
  assets: assetIds.map((assetId) => ({ assetId })),
  cover: clearSurfacePhotos(document.cover),
  spreads: document.spreads.map(clearSurfacePhotos),
})
