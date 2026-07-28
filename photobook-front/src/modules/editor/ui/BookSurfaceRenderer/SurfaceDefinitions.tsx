import type { PhotoSlot } from '@core/book'

import { getPhotoPalette } from '@editor/libs'

interface SurfaceDefinitionsProps {
  readonly artworkId: string
  readonly photoSlots: readonly PhotoSlot[]
}

export function SurfaceDefinitions({
  artworkId,
  photoSlots,
}: SurfaceDefinitionsProps) {
  return (
    <defs>
      {photoSlots.map((slot, index) => {
        const [startColor, endColor] = getPhotoPalette(slot.assetId)

        return (
          <g key={slot.id}>
            <linearGradient
              id={`${artworkId}-gradient-${index}`}
              x1="0"
              x2="1"
              y1="0"
              y2="1"
            >
              <stop offset="0" stopColor={startColor} />
              <stop offset="1" stopColor={endColor} />
            </linearGradient>
            <clipPath id={`${artworkId}-clip-${index}`}>
              <rect
                height={slot.frameMm.height}
                rx="1.5"
                width={slot.frameMm.width}
                x={slot.frameMm.x}
                y={slot.frameMm.y}
              />
            </clipPath>
          </g>
        )
      })}
    </defs>
  )
}
