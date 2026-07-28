import type {
  BookSurface,
  NormalizedPoint,
  NormalizedRect,
  PhysicalRectMm,
} from '@core/book/model'

export const hasSameRect = (first: PhysicalRectMm, second: PhysicalRectMm) =>
  first.x === second.x &&
  first.y === second.y &&
  first.width === second.width &&
  first.height === second.height

export const hasSameSize = (
  first: BookSurface['sizeMm'],
  second: BookSurface['sizeMm'],
) => first.width === second.width && first.height === second.height

export const isNormalizedPoint = ({ x, y }: NormalizedPoint) =>
  x >= 0 && x <= 1 && y >= 0 && y <= 1

export const isNormalizedRect = ({ x, y, width, height }: NormalizedRect) =>
  x >= 0 &&
  y >= 0 &&
  width > 0 &&
  height > 0 &&
  x + width <= 1 &&
  y + height <= 1
