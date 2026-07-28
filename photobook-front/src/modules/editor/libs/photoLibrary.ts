import type { AssetReference, BookDocumentV1, PhotoSlot } from '@core/book'

import type { PhotoFilter, PhotoSlotUsage } from '@editor/model'

export const getPhotoSlotUsages = (
  document: BookDocumentV1,
): readonly PhotoSlotUsage[] => [
  ...document.cover.photoSlots.map((slot) => ({
    slot,
    surfaceLabel: 'обложке',
  })),
  ...document.spreads.flatMap((spread, index) =>
    spread.photoSlots.map((slot) => ({
      slot,
      surfaceLabel: `развороте ${index * 2 + 2}–${index * 2 + 3}`,
    })),
  ),
]

export const getAssetUsageLabel = (
  asset: AssetReference,
  selectedPhotoSlot: PhotoSlot,
  usedAssetIds: ReadonlySet<string>,
) => {
  if (asset.assetId === selectedPhotoSlot.assetId) {
    return 'используется в этом слоте'
  }

  return usedAssetIds.has(asset.assetId)
    ? 'уже используется'
    : 'не используется'
}

export const getVisiblePhotoAssets = (
  document: BookDocumentV1,
  filter: PhotoFilter,
  usedAssetIds: ReadonlySet<string>,
) => {
  if (filter === 'used') {
    return document.assets.filter(({ assetId }) => usedAssetIds.has(assetId))
  }
  if (filter === 'unused') {
    return document.assets.filter(({ assetId }) => !usedAssetIds.has(assetId))
  }
  return document.assets
}
