import { describe, expect, it } from 'vitest'

import { calculateEffectivePhotoDpi } from './photoResolution'

describe('calculateEffectivePhotoDpi', () => {
  it('uses the weakest axis after applying the crop', () => {
    expect(
      calculateEffectivePhotoDpi({
        crop: { x: 0.25, y: 0.25, width: 0.5, height: 0.5 },
        frameMm: { width: 254, height: 127 },
        pixelSize: { width: 3_000, height: 2_000 },
      }),
    ).toBe(150)
  })

  it('returns zero for invalid physical or pixel dimensions', () => {
    expect(
      calculateEffectivePhotoDpi({
        crop: { x: 0, y: 0, width: 1, height: 1 },
        frameMm: { width: 0, height: 100 },
        pixelSize: { width: 1_000, height: 1_000 },
      }),
    ).toBe(0)
  })
})
