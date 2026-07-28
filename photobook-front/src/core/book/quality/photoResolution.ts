import type { NormalizedRect, PhysicalSizeMm } from '@core/book/model'

interface PhotoPixelSize {
  readonly width: number
  readonly height: number
}

interface CalculateEffectivePhotoDpiInput {
  readonly crop: NormalizedRect
  readonly frameMm: PhysicalSizeMm
  readonly pixelSize: PhotoPixelSize
}

const MILLIMETERS_PER_INCH = 25.4

export const calculateEffectivePhotoDpi = ({
  crop,
  frameMm,
  pixelSize,
}: CalculateEffectivePhotoDpiInput) => {
  if (
    frameMm.width <= 0 ||
    frameMm.height <= 0 ||
    pixelSize.width <= 0 ||
    pixelSize.height <= 0
  ) {
    return 0
  }

  const horizontalDpi =
    (pixelSize.width * crop.width * MILLIMETERS_PER_INCH) / frameMm.width
  const verticalDpi =
    (pixelSize.height * crop.height * MILLIMETERS_PER_INCH) / frameMm.height

  return Math.round(Math.min(horizontalDpi, verticalDpi))
}
