import type { LayoutSpec, ThemeSpec } from '@core/book'

import { getLayoutFramePosition } from '@editor/libs'

interface LayoutPreviewProps {
  readonly layout: LayoutSpec
  readonly theme: ThemeSpec
}

export function LayoutPreview({ layout, theme }: LayoutPreviewProps) {
  return (
    <span
      aria-hidden="true"
      className="relative block aspect-[2/1] overflow-hidden rounded-md border border-border"
      style={{ backgroundColor: theme.colors.background }}
    >
      {layout.photoSlots.map((slot) => (
        <span
          className="absolute border border-white/70 bg-ink-300"
          key={slot.slotKey}
          style={getLayoutFramePosition(slot.frameMm, layout.sizeMm)}
        />
      ))}
      {layout.textSlots.map((slot) => (
        <span
          className="absolute flex flex-col justify-center gap-0.5 px-1"
          key={slot.slotKey}
          style={getLayoutFramePosition(slot.frameMm, layout.sizeMm)}
        >
          <span
            className="block h-0.5 w-full rounded-full opacity-70"
            style={{ backgroundColor: theme.colors.foreground }}
          />
          <span
            className="block h-0.5 w-2/3 rounded-full opacity-40"
            style={{ backgroundColor: theme.colors.foreground }}
          />
        </span>
      ))}
    </span>
  )
}
