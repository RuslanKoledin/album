import type {
  NormalizedRect,
  PhysicalRect,
  PhysicalSize,
} from './bookValidation.types.js'

export const hasSameRect = (first: PhysicalRect, second: PhysicalRect) =>
  first.x === second.x &&
  first.y === second.y &&
  first.width === second.width &&
  first.height === second.height

export const hasSameSize = (first: PhysicalSize, second: PhysicalSize) =>
  first.width === second.width && first.height === second.height

export const isNormalizedPoint = ({
  x,
  y,
}: {
  readonly x: number
  readonly y: number
}) => x >= 0 && x <= 1 && y >= 0 && y <= 1

export const isNormalizedRect = ({ x, y, width, height }: NormalizedRect) =>
  x >= 0 &&
  y >= 0 &&
  width > 0 &&
  height > 0 &&
  x + width <= 1 &&
  y + height <= 1
