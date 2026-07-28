import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ErrorDialog } from './ErrorDialog'

describe('ErrorDialog', () => {
  it('renders nothing while closed', () => {
    render(
      <ErrorDialog
        open={false}
        title="Не удалось сохранить"
        description="Попробуйте ещё раз."
        onClose={vi.fn()}
      />,
    )

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('moves focus to the recovery action and supports retry', () => {
    const onRetry = vi.fn()

    render(
      <ErrorDialog
        open
        title="Не удалось сохранить"
        description="Ваши изменения остались в проекте."
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('alertdialog')).toHaveAccessibleName(
      'Не удалось сохранить',
    )

    const retryButton = screen.getByRole('button', {
      name: 'Попробовать снова',
    })

    expect(retryButton).toHaveFocus()
    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('closes with Escape and restores focus to the previous control', () => {
    const opener = document.createElement('button')
    const onClose = vi.fn()
    opener.textContent = 'Открыть диалог'
    document.body.append(opener)
    opener.focus()

    const { rerender } = render(
      <ErrorDialog
        open
        title="Не удалось сохранить"
        description="Ваши изменения остались в проекте."
        onClose={onClose}
      />,
    )

    expect(document.body).toHaveStyle({ overflow: 'hidden' })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()

    rerender(
      <ErrorDialog
        open={false}
        title="Не удалось сохранить"
        description="Ваши изменения остались в проекте."
        onClose={onClose}
      />,
    )

    expect(opener).toHaveFocus()
    expect(document.body).not.toHaveStyle({ overflow: 'hidden' })
    opener.remove()
  })

  it('keeps keyboard focus inside the dialog', () => {
    render(
      <ErrorDialog
        open
        title="Не удалось сохранить"
        description="Ваши изменения остались в проекте."
        onClose={vi.fn()}
        onRetry={vi.fn()}
      />,
    )

    const closeButton = screen.getByRole('button', { name: 'Закрыть' })
    const retryButton = screen.getByRole('button', {
      name: 'Попробовать снова',
    })

    expect(retryButton).toHaveFocus()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(retryButton).toHaveFocus()
  })
})
