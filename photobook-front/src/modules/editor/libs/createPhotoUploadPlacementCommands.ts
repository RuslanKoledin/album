import type { BookCommand, BookDocumentV1, PhotoSlot } from '@core/book'

const getEmptyPhotoSlots = (document: BookDocumentV1): readonly PhotoSlot[] =>
  [
    ...document.cover.photoSlots,
    ...document.spreads.flatMap(({ photoSlots }) => photoSlots),
  ].filter(({ assetId }) => assetId === null)

const dedupeAssetIds = (assetIds: readonly string[]) => {
  const seen = new Set<string>()

  return assetIds.filter((assetId) => {
    if (seen.has(assetId)) return false

    seen.add(assetId)
    return true
  })
}

export const createPhotoUploadPlacementCommands = (
  document: BookDocumentV1,
  assetIds: readonly string[],
): readonly BookCommand[] => {
  const uniqueAssetIds = dedupeAssetIds(assetIds)
  if (uniqueAssetIds.length === 0) return []

  const slotsToFill = getEmptyPhotoSlots(document).slice(
    0,
    uniqueAssetIds.length,
  )
  const assignCommands = uniqueAssetIds.flatMap<BookCommand>(
    (assetId, index) => {
      const slot = slotsToFill[index]
      if (!slot) return []

      return [
        {
          type: 'assign_photo',
          photoSlotId: slot.id,
          assetId,
        },
      ]
    },
  )

  return [{ type: 'add_assets', assetIds: uniqueAssetIds }, ...assignCommands]
}
