import type { AssetDto } from '@photo-upload/model'

interface SeededAssetFixture {
  readonly fileName: string
  readonly path: string
  readonly sizeBytes: number
}

const SEEDED_ASSET_FIXTURES: Readonly<Record<string, SeededAssetFixture>> = {
  'mock-asset-cover': {
    fileName: 'family-mountains.jpg',
    path: '/images/demo/family-mountains.jpg',
    sizeBytes: 272_000,
  },
  'mock-asset-spread-01': {
    fileName: 'family-table.jpg',
    path: '/images/demo/family-table.jpg',
    sizeBytes: 329_000,
  },
  'mock-asset-extra-01': {
    fileName: 'issyk-kul.jpg',
    path: '/images/demo/issyk-kul.jpg',
    sizeBytes: 266_000,
  },
  'mock-asset-extra-02': {
    fileName: 'child-wildflowers.jpg',
    path: '/images/demo/child-wildflowers.jpg',
    sizeBytes: 209_000,
  },
}

const getAbsoluteUrl = (path: string) => {
  const origin =
    typeof location === 'undefined' ? 'http://localhost' : location.origin
  return new URL(path, origin).toString()
}

export const getSeededAssetFixtures = (
  assetIds: readonly string[],
): AssetDto[] =>
  assetIds.flatMap((assetId) => {
    const fixture = SEEDED_ASSET_FIXTURES[assetId]
    if (!fixture) return []

    return [
      {
        assetId,
        status: 'ready',
        fileName: fixture.fileName,
        mediaType: 'image/jpeg',
        sizeBytes: fixture.sizeBytes,
        pixelWidth: 1200,
        pixelHeight: 800,
        capturedAt: null,
        thumbnailUrl: getAbsoluteUrl(fixture.path),
        thumbnailExpiresAt: null,
        createdAt: '2026-07-21T08:30:00Z',
      },
    ]
  })
