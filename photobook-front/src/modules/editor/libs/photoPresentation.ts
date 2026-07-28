const MOCK_PHOTO_PALETTES = [
  ['#6f5544', '#c0a58e'],
  ['#53685c', '#a6b7aa'],
  ['#785451', '#c7a09a'],
  ['#665c78', '#aaa0bb'],
] as const

const MOCK_PHOTO_PIXEL_SIZES = new Map<
  string,
  { readonly height: number; readonly width: number }
>([
  ['mock-asset-cover', { width: 4_200, height: 3_200 }],
  ['mock-asset-spread-01', { width: 6_000, height: 3_200 }],
  ['mock-asset-extra-01', { width: 900, height: 900 }],
  ['mock-asset-extra-02', { width: 4_000, height: 3_000 }],
])

export const MOCK_MIN_PRINT_DPI = 240

const getAssetHash = (assetId: string) =>
  [...assetId].reduce(
    (result, character) => result + character.charCodeAt(0),
    0,
  )

export const getPhotoPalette = (assetId: string | null) => {
  if (!assetId) return ['#e8e0d2', '#f4f0e7'] as const

  return (
    MOCK_PHOTO_PALETTES[getAssetHash(assetId) % MOCK_PHOTO_PALETTES.length] ??
    MOCK_PHOTO_PALETTES[0]
  )
}

export const getPhotoLabel = (index: number) =>
  `Фото ${String(index + 1).padStart(2, '0')}`

export const getMockPhotoPixelSize = (assetId: string | null) =>
  assetId ? MOCK_PHOTO_PIXEL_SIZES.get(assetId) : undefined
