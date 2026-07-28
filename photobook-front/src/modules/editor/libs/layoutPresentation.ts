import type { LayoutSpec, PhysicalRectMm, PhysicalSizeMm } from '@core/book'

export const getLayoutPhotoCounts = (layouts: readonly LayoutSpec[]) =>
  [...new Set(layouts.map(({ photoSlots }) => photoSlots.length))].sort(
    (first, second) => first - second,
  )

export const getLayoutOptionLabel = (layout: LayoutSpec) => {
  const photoCount = layout.photoSlots.length

  if (layout.textSlots.length > 0) return 'Фото и подпись'
  if (photoCount === 1) return 'Фото на весь разворот'
  return `Коллаж: ${photoCount} фото`
}

export const getLayoutFramePosition = (
  frame: PhysicalRectMm,
  surface: PhysicalSizeMm,
) => ({
  height: `${(frame.height / surface.height) * 100}%`,
  left: `${(frame.x / surface.width) * 100}%`,
  top: `${(frame.y / surface.height) * 100}%`,
  width: `${(frame.width / surface.width) * 100}%`,
})
