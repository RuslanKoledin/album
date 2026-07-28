import type { Asset } from '@photobook/database'

import type { StorageService } from '@api/modules/storage/storage.service.js'

export async function mapAsset(asset: Asset, storage: StorageService) {
  const preview =
    asset.status === 'READY'
      ? await storage.createPreviewUrl(asset.objectKey)
      : null

  return {
    assetId: asset.id,
    capturedAt: asset.capturedAt?.toISOString() ?? null,
    createdAt: asset.createdAt.toISOString(),
    fileName: asset.originalFileName,
    mediaType: asset.mediaType,
    pixelHeight: asset.pixelHeight,
    pixelWidth: asset.pixelWidth,
    sizeBytes: Number(asset.storedSize ?? asset.expectedSize),
    status: asset.status.toLowerCase(),
    thumbnailExpiresAt: preview?.expiresAt.toISOString() ?? null,
    thumbnailUrl: preview?.url ?? null,
  }
}
