import type { BookDocumentV1 } from '@core/book/model'

import type { BookDocumentValidationIssue } from './bookDocumentValidation'

export const validateUniqueBookIds = (
  document: BookDocumentV1,
  issues: BookDocumentValidationIssue[],
) => {
  const seenIds = new Map<string, string>()
  const registerId = (id: string, path: string) => {
    const firstPath = seenIds.get(id)

    if (firstPath) {
      issues.push({ code: 'duplicate_id', path, relatedId: id })
      return
    }

    seenIds.set(id, path)
  }

  document.assets.forEach(({ assetId }, index) =>
    registerId(assetId, `/assets/${index}/assetId`),
  )
  document.cover.photoSlots.forEach(({ id }, index) =>
    registerId(id, `/cover/photoSlots/${index}/id`),
  )
  document.cover.textBlocks.forEach(({ id }, index) =>
    registerId(id, `/cover/textBlocks/${index}/id`),
  )
  document.spreads.forEach((spread, spreadIndex) => {
    registerId(spread.id, `/spreads/${spreadIndex}/id`)
    spread.photoSlots.forEach(({ id }, slotIndex) =>
      registerId(id, `/spreads/${spreadIndex}/photoSlots/${slotIndex}/id`),
    )
    spread.textBlocks.forEach(({ id }, textIndex) =>
      registerId(id, `/spreads/${spreadIndex}/textBlocks/${textIndex}/id`),
    )
  })
}
