import { useId } from 'react'

import { PhotoSlotLayer } from './PhotoSlotLayer'
import { SurfaceDefinitions } from './SurfaceDefinitions'
import { TextBlockLayer } from './TextBlockLayer'
import type { BookSurfaceRendererProps } from './types'

export function BookSurfaceRenderer({
  compact = false,
  onSelectElement,
  photoAdjustmentPreview,
  photoSources,
  selectedElementId,
  surface,
  theme,
}: BookSurfaceRendererProps) {
  const artworkId = `photo-${useId().replaceAll(':', '')}`
  const background = theme?.colors.background ?? '#f6f0e8'
  const accent = theme?.colors.accent ?? '#8e5737'

  return (
    <svg
      aria-label="Макет выбранной страницы"
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      role={onSelectElement ? 'group' : 'img'}
      viewBox={`0 0 ${surface.sizeMm.width} ${surface.sizeMm.height}`}
    >
      <SurfaceDefinitions
        artworkId={artworkId}
        photoSlots={surface.photoSlots}
      />
      <rect
        fill={background}
        height={surface.sizeMm.height}
        width={surface.sizeMm.width}
      />
      {surface.photoSlots.map((slot, index) => {
        const adjustment =
          photoAdjustmentPreview?.photoSlotId === slot.id
            ? photoAdjustmentPreview
            : null

        return (
          <PhotoSlotLayer
            accent={accent}
            artworkId={artworkId}
            compact={compact}
            crop={adjustment?.crop ?? slot.crop}
            focalPoint={adjustment?.focalPoint ?? slot.focalPoint}
            index={index}
            key={slot.id}
            selected={selectedElementId === slot.id}
            slot={slot}
            sourceUrl={slot.assetId ? photoSources?.[slot.assetId] : undefined}
            onSelect={onSelectElement}
          />
        )
      })}
      {surface.textBlocks.map((textBlock) => (
        <TextBlockLayer
          accent={accent}
          compact={compact}
          key={textBlock.id}
          selected={selectedElementId === textBlock.id}
          style={theme?.textStyles.find(
            ({ id }) => id === textBlock.textStyleId,
          )}
          textBlock={textBlock}
          theme={theme}
          onSelect={onSelectElement}
        />
      ))}
    </svg>
  )
}
