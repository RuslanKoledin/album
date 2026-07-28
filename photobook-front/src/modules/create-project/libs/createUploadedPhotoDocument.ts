import type { BookDocumentV1, BookSurface } from '@core/book'

const assignSurfacePhotos = <TSurface extends BookSurface>(
  surface: TSurface,
  getNextAssetId: () => string | null,
) => ({
  ...surface,
  photoSlots: surface.photoSlots.map((slot) => ({
    ...slot,
    assetId: getNextAssetId(),
  })),
})

export const createUploadedPhotoDocument = (
  document: BookDocumentV1,
  assetIds: readonly string[],
): BookDocumentV1 => {
  let assetIndex = 0
  const getNextAssetId = () => assetIds[assetIndex++] ?? null

  return {
    ...document,
    assets: assetIds.map((assetId) => ({ assetId })),
    cover: assignSurfacePhotos(document.cover, getNextAssetId),
    spreads: document.spreads.map((spread) =>
      assignSurfacePhotos(spread, getNextAssetId),
    ),
  }
}
