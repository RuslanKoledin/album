import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { BookSurface } from '@core/book'
import { createMinimalBookDocumentV1Fixture } from '@mocks/book'

import { BookSurfaceRenderer } from './BookSurfaceRenderer'

const surface: BookSurface = {
  layoutId: 'layout-test',
  sizeMm: { width: 400, height: 200 },
  photoSlots: [],
  textBlocks: [],
}

describe('BookSurfaceRenderer', () => {
  it('keeps the physical viewBox when presentation size changes', () => {
    const { rerender } = render(
      <BookSurfaceRenderer surface={surface} theme={undefined} />,
    )
    const renderer = screen.getByRole('img', {
      name: 'Макет выбранной страницы',
    })

    expect(renderer).toHaveAttribute('viewBox', '0 0 400 200')
    expect(renderer).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet')

    rerender(
      <BookSurfaceRenderer compact surface={surface} theme={undefined} />,
    )

    expect(renderer).toHaveAttribute('viewBox', '0 0 400 200')
  })

  it('renders a temporary thumbnail for a matching stable asset id', () => {
    const document = createMinimalBookDocumentV1Fixture()
    const { container } = render(
      <BookSurfaceRenderer
        photoSources={{ 'mock-asset-cover': 'https://media.example/photo.jpg' }}
        surface={document.cover}
        theme={undefined}
      />,
    )

    expect(container.querySelector('image')).toHaveAttribute(
      'href',
      'https://media.example/photo.jpg',
    )
    expect(screen.queryByText('Фотография')).not.toBeInTheDocument()
  })
})
