import { useEffect, useRef } from 'react'

interface UseMobilePropertiesPanelFocusInput {
  readonly open: boolean
  readonly onClose: () => void
}

const mobileViewportQuery = '(max-width: 47.999rem)'

export const useMobilePropertiesPanelFocus = ({
  open,
  onClose,
}: UseMobilePropertiesPanelFocusInput) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open || !window.matchMedia(mobileViewportQuery).matches) return

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElement?.focus()
    }
  }, [open])

  return { closeButtonRef, panelRef }
}
