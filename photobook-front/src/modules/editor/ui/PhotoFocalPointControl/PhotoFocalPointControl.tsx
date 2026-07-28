import { useRef, type KeyboardEvent, type PointerEvent } from 'react'

import type { NormalizedPoint } from '@core/book'

import {
  getFocalPointFromClientPosition,
  getPhotoPalette,
  isFocalPointArrowKey,
  nudgeFocalPoint,
} from '@editor/libs'

interface PhotoFocalPointControlProps {
  readonly assetId: string
  readonly point: NormalizedPoint
  readonly onCancelPreview: () => void
  readonly onCommit: (point: NormalizedPoint) => void
  readonly onPreview: (point: NormalizedPoint) => void
}

export function PhotoFocalPointControl({
  assetId,
  point,
  onCancelPreview,
  onCommit,
  onPreview,
}: PhotoFocalPointControlProps) {
  const activePointerId = useRef<number | null>(null)
  const [startColor, endColor] = getPhotoPalette(assetId)

  const pointFromEvent = (event: PointerEvent<HTMLDivElement>) =>
    getFocalPointFromClientPosition(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect(),
    )

  const previewPointer = (event: PointerEvent<HTMLDivElement>) => {
    const nextPoint = pointFromEvent(event)
    onPreview(nextPoint)
    return nextPoint
  }

  const handleMarkerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!isFocalPointArrowKey(event.key)) return

    event.preventDefault()
    const nextPoint = nudgeFocalPoint(point, event.key)
    onCommit(nextPoint)
  }

  return (
    <section className="mt-5" aria-labelledby="focal-point-title">
      <h4 className="text-sm font-semibold" id="focal-point-title">
        Важная область
      </h4>
      <p className="mt-1 text-xs leading-5 text-ink-500">
        Перетащите маркер на лицо или главный объект фотографии.
      </p>

      <div
        aria-label="Положение важной области"
        className="relative mt-3 h-36 touch-none overflow-hidden rounded-xl border border-control-border"
        role="group"
        style={{
          background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
        }}
        onPointerCancel={() => {
          activePointerId.current = null
          onCancelPreview()
        }}
        onPointerDown={(event) => {
          activePointerId.current = event.pointerId
          event.currentTarget.setPointerCapture?.(event.pointerId)
          previewPointer(event)
        }}
        onPointerMove={(event) => {
          if (activePointerId.current !== event.pointerId) return
          previewPointer(event)
        }}
        onPointerUp={(event) => {
          if (activePointerId.current !== event.pointerId) return

          const nextPoint = previewPointer(event)
          activePointerId.current = null
          event.currentTarget.releasePointerCapture?.(event.pointerId)
          onCommit(nextPoint)
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/5 bg-ink-950/20"
        />
        <button
          aria-label={`Важная область: ${Math.round(point.x * 100)}% по горизонтали, ${Math.round(point.y * 100)}% по вертикали`}
          className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-surface/20 shadow-floating"
          style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          type="button"
          onKeyDown={handleMarkerKeyDown}
        >
          <span className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent-600" />
        </button>
      </div>
      <p className="mt-2 text-[0.6875rem] text-ink-500">
        Для точной настройки используйте стрелки на клавиатуре.
      </p>
    </section>
  )
}
