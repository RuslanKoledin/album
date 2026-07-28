import type { LayoutSpec } from '@core/book/configuration'
import type { BookSurface } from '@core/book/model'

import type { BookDocumentValidationIssue } from './bookDocumentValidation'
import {
  hasSameRect,
  isNormalizedPoint,
  isNormalizedRect,
} from './validationGeometry'

interface PhotoSlotsValidationInput {
  readonly surface: BookSurface
  readonly layout: LayoutSpec
  readonly path: string
  readonly issues: BookDocumentValidationIssue[]
}

interface PhotoSlotValuesValidationInput {
  readonly surface: BookSurface
  readonly path: string
  readonly assets: ReadonlySet<string>
  readonly issues: BookDocumentValidationIssue[]
}

export const validatePhotoSlotValues = ({
  surface,
  path,
  assets,
  issues,
}: PhotoSlotValuesValidationInput) => {
  surface.photoSlots.forEach((slot, index) => {
    const slotPath = `${path}/photoSlots/${index}`

    if (slot.assetId && !assets.has(slot.assetId)) {
      issues.push({
        code: 'unknown_asset',
        path: `${slotPath}/assetId`,
        relatedId: slot.assetId,
      })
    }
    if (!isNormalizedRect(slot.crop)) {
      issues.push({ code: 'crop_out_of_bounds', path: `${slotPath}/crop` })
    }
    if (!isNormalizedPoint(slot.focalPoint)) {
      issues.push({
        code: 'focal_point_out_of_bounds',
        path: `${slotPath}/focalPoint`,
      })
    }
  })
}

export const validatePhotoSlots = ({
  surface,
  layout,
  path,
  issues,
}: PhotoSlotsValidationInput) => {
  const seenSlotKeys = new Set<string>()

  surface.photoSlots.forEach((slot, index) => {
    const slotPath = `${path}/photoSlots/${index}`
    const slotSpec = layout.photoSlots.find(
      ({ slotKey }) => slotKey === slot.layoutSlotKey,
    )

    if (seenSlotKeys.has(slot.layoutSlotKey) || !slotSpec) {
      issues.push({
        code: 'layout_slot_mismatch',
        path: `${slotPath}/layoutSlotKey`,
        relatedId: slot.layoutSlotKey,
      })
      return
    }

    seenSlotKeys.add(slot.layoutSlotKey)
    if (!hasSameRect(slot.frameMm, slotSpec.frameMm)) {
      issues.push({
        code: 'layout_geometry_mismatch',
        path: `${slotPath}/frameMm`,
      })
    }
    if (slotSpec.required && !slot.assetId) {
      issues.push({
        code: 'required_photo_missing',
        path: `${slotPath}/assetId`,
      })
    }
  })

  layout.photoSlots
    .filter(({ required }) => required)
    .forEach((slotSpec) => {
      if (!seenSlotKeys.has(slotSpec.slotKey)) {
        issues.push({
          code: 'layout_slot_mismatch',
          path: `${path}/photoSlots`,
          relatedId: slotSpec.slotKey,
        })
      }
    })
}
