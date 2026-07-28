import type { NormalizedPoint, NormalizedRect, PhotoSlot } from '@core/book'

export interface PhotoArtworkGeometry {
  readonly height: number
  readonly width: number
  readonly x: number
  readonly y: number
}

export const getPhotoArtworkGeometry = (
  slot: PhotoSlot,
  crop: NormalizedRect,
): PhotoArtworkGeometry => {
  const width = slot.frameMm.width / crop.width
  const height = slot.frameMm.height / crop.height

  return {
    width,
    height,
    x: slot.frameMm.x - crop.x * width,
    y: slot.frameMm.y - crop.y * height,
  }
}

export const getFocalMarkerPosition = (
  slot: PhotoSlot,
  crop: NormalizedRect,
  focalPoint: NormalizedPoint,
) => ({
  x:
    slot.frameMm.x +
    Math.min(
      slot.frameMm.width,
      Math.max(0, ((focalPoint.x - crop.x) / crop.width) * slot.frameMm.width),
    ),
  y:
    slot.frameMm.y +
    Math.min(
      slot.frameMm.height,
      Math.max(
        0,
        ((focalPoint.y - crop.y) / crop.height) * slot.frameMm.height,
      ),
    ),
})
