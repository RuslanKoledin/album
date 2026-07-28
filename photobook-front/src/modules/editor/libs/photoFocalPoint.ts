import type { NormalizedPoint } from '@core/book'

export type FocalPointArrowKey =
  'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp'

interface ClientRectBounds {
  readonly height: number
  readonly left: number
  readonly top: number
  readonly width: number
}

const clampNormalized = (value: number) =>
  Number(Math.min(1, Math.max(0, value)).toFixed(4))

export const getFocalPointFromClientPosition = (
  clientX: number,
  clientY: number,
  rect: ClientRectBounds,
): NormalizedPoint => ({
  x: rect.width > 0 ? clampNormalized((clientX - rect.left) / rect.width) : 0.5,
  y:
    rect.height > 0 ? clampNormalized((clientY - rect.top) / rect.height) : 0.5,
})

export const nudgeFocalPoint = (
  point: NormalizedPoint,
  key: FocalPointArrowKey,
  step = 0.05,
): NormalizedPoint => ({
  x: clampNormalized(
    point.x + (key === 'ArrowRight' ? step : key === 'ArrowLeft' ? -step : 0),
  ),
  y: clampNormalized(
    point.y + (key === 'ArrowDown' ? step : key === 'ArrowUp' ? -step : 0),
  ),
})

export const isFocalPointArrowKey = (key: string): key is FocalPointArrowKey =>
  key === 'ArrowDown' ||
  key === 'ArrowLeft' ||
  key === 'ArrowRight' ||
  key === 'ArrowUp'
