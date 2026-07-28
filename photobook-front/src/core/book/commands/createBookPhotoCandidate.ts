import type { BookDocumentV1 } from '@core/book/model'

import type { BookCommand } from './bookCommand'
import type { BookCommandCandidateResult } from './bookCommandApplication'
import { invalidCommand, targetNotFound } from './bookCommandCandidateErrors'
import { findPhotoSlot, mapPhotoSlots } from './bookDocumentTransforms'

type BookPhotoCommand = Extract<
  BookCommand,
  {
    type:
      | 'assign_photo'
      | 'remove_photo'
      | 'set_photo_crop'
      | 'set_photo_focal_point'
      | 'swap_photos'
  }
>

export const createBookPhotoCandidate = (
  document: BookDocumentV1,
  command: BookPhotoCommand,
): BookCommandCandidateResult => {
  if (command.type === 'swap_photos') {
    if (command.firstPhotoSlotId === command.secondPhotoSlotId) {
      return invalidCommand(
        command.type,
        'Photo slot IDs must reference two different slots',
      )
    }

    const first = findPhotoSlot(document, command.firstPhotoSlotId)
    const second = findPhotoSlot(document, command.secondPhotoSlotId)

    if (!first) return targetNotFound(command.type, command.firstPhotoSlotId)
    if (!second) return targetNotFound(command.type, command.secondPhotoSlotId)

    return {
      ok: true,
      document: mapPhotoSlots(document, (slot) => {
        const source =
          slot.id === first.id ? second : slot.id === second.id ? first : null

        return source
          ? {
              ...slot,
              assetId: source.assetId,
              crop: { ...source.crop },
              focalPoint: { ...source.focalPoint },
            }
          : slot
      }),
    }
  }

  if (!findPhotoSlot(document, command.photoSlotId)) {
    return targetNotFound(command.type, command.photoSlotId)
  }

  return {
    ok: true,
    document: mapPhotoSlots(document, (slot) => {
      if (slot.id !== command.photoSlotId) return slot

      switch (command.type) {
        case 'assign_photo':
          return { ...slot, assetId: command.assetId }
        case 'remove_photo':
          return { ...slot, assetId: null }
        case 'set_photo_crop':
          return { ...slot, crop: { ...command.crop } }
        case 'set_photo_focal_point':
          return { ...slot, focalPoint: { ...command.focalPoint } }
      }
    }),
  }
}
