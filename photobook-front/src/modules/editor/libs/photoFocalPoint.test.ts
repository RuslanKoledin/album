import { describe, expect, it } from 'vitest'

import {
  getFocalPointFromClientPosition,
  nudgeFocalPoint,
} from './photoFocalPoint'

describe('photo focal point', () => {
  it('maps a client position to normalized coordinates and clamps the edges', () => {
    const rect = { left: 100, top: 50, width: 200, height: 100 }

    expect(getFocalPointFromClientPosition(250, 75, rect)).toEqual({
      x: 0.75,
      y: 0.25,
    })
    expect(getFocalPointFromClientPosition(20, 300, rect)).toEqual({
      x: 0,
      y: 1,
    })
  })

  it('nudges a point with keyboard steps without leaving the image', () => {
    expect(nudgeFocalPoint({ x: 0.5, y: 0.5 }, 'ArrowRight')).toEqual({
      x: 0.55,
      y: 0.5,
    })
    expect(nudgeFocalPoint({ x: 0.98, y: 0.02 }, 'ArrowRight')).toEqual({
      x: 1,
      y: 0.02,
    })
  })
})
