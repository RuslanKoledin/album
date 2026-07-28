import type { NormalizedRect, PhysicalSize } from './bookValidation.types.js'

interface CalculatePhotoDpiInput {
  readonly crop: NormalizedRect
  readonly frameMm: PhysicalSize
  readonly pixelSize: PhysicalSize
}

const MILLIMETERS_PER_INCH = 25.4

export function calculateEffectivePhotoDpi({
  crop,
  frameMm,
  pixelSize,
}: CalculatePhotoDpiInput) {
  if (
    frameMm.width <= 0 ||
    frameMm.height <= 0 ||
    pixelSize.width <= 0 ||
    pixelSize.height <= 0
  ) {
    return 0
  }
  const horizontal =
    (pixelSize.width * crop.width * MILLIMETERS_PER_INCH) / frameMm.width
  const vertical =
    (pixelSize.height * crop.height * MILLIMETERS_PER_INCH) / frameMm.height

  return Math.round(Math.min(horizontal, vertical))
}
