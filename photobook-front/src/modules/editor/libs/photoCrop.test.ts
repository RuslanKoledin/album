import { describe, expect, it } from 'vitest'

import {
  createCenteredCropFromZoom,
  createCropFromZoomAndFocalPoint,
} from './photoCrop'

describe('createCenteredCropFromZoom', () => {
  it('keeps the full image at 100 percent zoom', () => {
    expect(createCenteredCropFromZoom(1)).toEqual({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    })
  })

  it('creates a centered normalized crop for a larger zoom', () => {
    expect(createCenteredCropFromZoom(2)).toEqual({
      x: 0.25,
      y: 0.25,
      width: 0.5,
      height: 0.5,
    })
  })

  it('clamps unsupported zoom values to the editor range', () => {
    expect(createCenteredCropFromZoom(0.5)).toEqual(
      createCenteredCropFromZoom(1),
    )
    expect(createCenteredCropFromZoom(5)).toEqual(createCenteredCropFromZoom(2))
  })

  it('positions the crop around the focal point and clamps it to the image', () => {
    expect(createCropFromZoomAndFocalPoint(2, { x: 0.7, y: 0.35 })).toEqual({
      x: 0.45,
      y: 0.1,
      width: 0.5,
      height: 0.5,
    })

    expect(createCropFromZoomAndFocalPoint(2, { x: 0.05, y: 0.95 })).toEqual({
      x: 0,
      y: 0.5,
      width: 0.5,
      height: 0.5,
    })
  })
})
