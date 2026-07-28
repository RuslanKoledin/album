import { useEffect, useRef } from 'react'

interface UseErrorDialogFocusInput {
  readonly onClose: (() => void) | undefined
  readonly open: boolean
}

const getFocusableElements = (dialog: HTMLElement) =>
  Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.tabIndex >= 0)

export const useErrorDialogFocus = ({
  onClose,
  open,
}: UseErrorDialogFocusInput) => {
  const dialogRef = useRef<HTMLElement>(null)
  const closeActionRef = useRef<HTMLButtonElement>(null)
  const retryActionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const dialog = dialogRef.current
    const previousBodyOverflow = document.body.style.overflow
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    document.body.style.overflow = 'hidden'
    ;(retryActionRef.current ?? closeActionRef.current ?? dialog)?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialog) return

      const focusableElements = getFocusableElements(dialog)
      const firstElement = focusableElements.at(0)
      const lastElement = focusableElements.at(-1)

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      previouslyFocusedElement?.focus()
    }
  }, [onClose, open])

  return { closeActionRef, dialogRef, retryActionRef }
}
