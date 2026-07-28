import type { NormalizedPoint, NormalizedRect } from '@core/book'

export const MIN_PHOTO_ZOOM = 1
export const MAX_PHOTO_ZOOM = 2

export interface PhotoAdjustmentPreview {
  readonly crop: NormalizedRect
  readonly focalPoint: NormalizedPoint
  readonly photoSlotId: string
}

const roundNormalizedValue = (value: number) => Number(value.toFixed(6))

export const createCenteredCropFromZoom = (zoom: number): NormalizedRect => {
  return createCropFromZoomAndFocalPoint(zoom, { x: 0.5, y: 0.5 })
}

export const createCropFromZoomAndFocalPoint = (
  zoom: number,
  focalPoint: NormalizedPoint,
): NormalizedRect => {
  const normalizedZoom = Math.min(
    MAX_PHOTO_ZOOM,
    Math.max(MIN_PHOTO_ZOOM, zoom),
  )
  const size = roundNormalizedValue(1 / normalizedZoom)
  const maxOffset = 1 - size
  const x = roundNormalizedValue(
    Math.min(maxOffset, Math.max(0, focalPoint.x - size / 2)),
  )
  const y = roundNormalizedValue(
    Math.min(maxOffset, Math.max(0, focalPoint.y - size / 2)),
  )

  return {
    x,
    y,
    width: size,
    height: size,
  }
}

export const getZoomFromCrop = (crop: NormalizedRect) =>
  Math.min(
    MAX_PHOTO_ZOOM,
    Math.max(MIN_PHOTO_ZOOM, 1 / Math.min(crop.width, crop.height)),
  )
