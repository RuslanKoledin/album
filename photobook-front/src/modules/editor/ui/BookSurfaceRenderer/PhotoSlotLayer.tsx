import type { KeyboardEvent } from 'react'

import type { NormalizedPoint, NormalizedRect, PhotoSlot } from '@core/book'

import { getFocalMarkerPosition, getPhotoArtworkGeometry } from '@editor/libs'

interface PhotoSlotLayerProps {
  readonly accent: string
  readonly artworkId: string
  readonly compact: boolean
  readonly crop: NormalizedRect
  readonly focalPoint: NormalizedPoint
  readonly index: number
  readonly onSelect: ((id: string, kind: 'photo' | 'text') => void) | undefined
  readonly selected: boolean
  readonly slot: PhotoSlot
  readonly sourceUrl: string | undefined
}

export function PhotoSlotLayer({
  accent,
  artworkId,
  compact,
  crop,
  focalPoint,
  index,
  onSelect,
  selected,
  slot,
  sourceUrl,
}: PhotoSlotLayerProps) {
  const artwork = getPhotoArtworkGeometry(slot, crop)
  const focalMarker = getFocalMarkerPosition(slot, crop, focalPoint)
  const selectPhoto = () => onSelect?.(slot.id, 'photo')
  const selectWithKeyboard = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    selectPhoto()
  }

  return (
    <g
      aria-label={onSelect ? 'Выбрать фотографию' : undefined}
      className={onSelect ? 'cursor-pointer' : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={selectPhoto}
      onFocus={selectPhoto}
      onKeyDown={selectWithKeyboard}
    >
      <g clipPath={`url(#${artworkId}-clip-${index})`}>
        <rect
          fill={`url(#${artworkId}-gradient-${index})`}
          height={artwork.height}
          width={artwork.width}
          x={artwork.x}
          y={artwork.y}
        />
        {sourceUrl && (
          <image
            height={artwork.height}
            href={sourceUrl}
            preserveAspectRatio="xMidYMid slice"
            width={artwork.width}
            x={artwork.x}
            y={artwork.y}
          />
        )}
        {slot.assetId && !sourceUrl && (
          <>
            <circle
              cx={artwork.x + artwork.width * 0.72}
              cy={artwork.y + artwork.height * 0.3}
              fill="#ffffff"
              opacity="0.2"
              r={Math.min(artwork.width, artwork.height) * 0.16}
            />
            <path
              d={`M ${artwork.x} ${artwork.y + artwork.height * 0.82} L ${artwork.x + artwork.width * 0.38} ${artwork.y + artwork.height * 0.48} L ${artwork.x + artwork.width * 0.62} ${artwork.y + artwork.height * 0.7} L ${artwork.x + artwork.width} ${artwork.y + artwork.height * 0.38} L ${artwork.x + artwork.width} ${artwork.y + artwork.height} L ${artwork.x} ${artwork.y + artwork.height} Z`}
              fill="#171713"
              opacity="0.18"
            />
          </>
        )}
      </g>
      <rect
        fill="transparent"
        height={slot.frameMm.height}
        rx="1.5"
        stroke={selected ? accent : 'transparent'}
        strokeWidth={selected ? 2 : 0}
        width={slot.frameMm.width}
        x={slot.frameMm.x}
        y={slot.frameMm.y}
      />
      {selected && slot.assetId && !compact && (
        <g aria-hidden="true" pointerEvents="none">
          <circle
            cx={focalMarker.x}
            cy={focalMarker.y}
            fill="transparent"
            r="7"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <circle
            cx={focalMarker.x}
            cy={focalMarker.y}
            fill={accent}
            r="2.5"
            stroke="#ffffff"
            strokeWidth="1"
          />
        </g>
      )}
      {!compact && !sourceUrl && (
        <text
          dominantBaseline="middle"
          fill="#ffffff"
          fontFamily="Inter, sans-serif"
          fontSize="6"
          textAnchor="middle"
          x={slot.frameMm.x + slot.frameMm.width / 2}
          y={slot.frameMm.y + slot.frameMm.height / 2}
        >
          {slot.assetId ? 'Фотография' : 'Добавьте фото'}
        </text>
      )}
    </g>
  )
}
