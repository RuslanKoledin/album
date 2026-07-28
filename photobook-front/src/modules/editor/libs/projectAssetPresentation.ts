import type { AssetDto } from '@modules/photo-upload'
import type { ResolvePhotoPixelSize } from '@modules/preflight'

import { getMockPhotoPixelSize } from './photoPresentation'

export const createPhotoSourceMap = (assets: readonly AssetDto[]) =>
  Object.fromEntries(
    assets.flatMap(({ assetId, status, thumbnailUrl }) =>
      status === 'ready' && thumbnailUrl ? [[assetId, thumbnailUrl]] : [],
    ),
  ) as Readonly<Record<string, string>>

export const createPhotoPixelSizeResolver = (
  assets: readonly AssetDto[],
): ResolvePhotoPixelSize => {
  const sizes = new Map(
    assets.flatMap(({ assetId, pixelHeight, pixelWidth }) =>
      pixelHeight && pixelWidth
        ? [[assetId, { height: pixelHeight, width: pixelWidth }] as const]
        : [],
    ),
  )

  return (assetId) => sizes.get(assetId) ?? getMockPhotoPixelSize(assetId)
}
