import { useDispatch } from 'react-redux'

import type {
  BookConfigurationBundle,
  BookDocumentV1,
  NormalizedPoint,
  NormalizedRect,
  PhotoSlot,
  TextBlock,
} from '@core/book'

import {
  createPhotoUploadPlacementCommands,
  type PhotoAdjustmentPreview,
} from '@editor/libs'
import { editorActions } from '@editor/model'

interface UseEditorCommandsInput {
  readonly configuration: BookConfigurationBundle | undefined
  readonly document: BookDocumentV1 | undefined
  readonly selectedPhotoSlot: PhotoSlot | null
  readonly selectedTextBlock: TextBlock | null
  readonly setPhotoAdjustmentPreview: (
    preview: PhotoAdjustmentPreview | null,
  ) => void
}

export const useEditorCommands = ({
  configuration,
  document,
  selectedPhotoSlot,
  selectedTextBlock,
  setPhotoAdjustmentPreview,
}: UseEditorCommandsInput) => {
  const dispatch = useDispatch()
  const commit = (
    command: Parameters<typeof editorActions.commandCommitted>[0]['command'],
  ) => {
    if (!configuration) return
    dispatch(editorActions.commandCommitted({ command, configuration }))
  }

  return {
    addAssetsAndFillEmptySlots: (assetIds: readonly string[]) => {
      if (!configuration || !document || assetIds.length === 0) return

      const commands = createPhotoUploadPlacementCommands(document, assetIds)
      if (commands.length === 0) return

      setPhotoAdjustmentPreview(null)
      dispatch(
        editorActions.commandBatchCommitted({
          commands,
          configuration,
        }),
      )
    },
    applyCrop: (crop: NormalizedRect) => {
      if (!selectedPhotoSlot) return
      commit({
        type: 'set_photo_crop',
        photoSlotId: selectedPhotoSlot.id,
        crop,
      })
    },
    applyText: (text: string) => {
      if (!selectedTextBlock) return
      commit(
        text.length > 0
          ? {
              type: 'set_text',
              textBlockId: selectedTextBlock.id,
              text,
            }
          : { type: 'remove_text', textBlockId: selectedTextBlock.id },
      )
    },
    assignPhoto: (assetId: string) => {
      if (!selectedPhotoSlot) return
      setPhotoAdjustmentPreview(null)
      commit({
        type: 'assign_photo',
        photoSlotId: selectedPhotoSlot.id,
        assetId,
      })
    },
    commitFocalPoint: (focalPoint: NormalizedPoint, crop: NormalizedRect) => {
      if (!selectedPhotoSlot || !configuration) return
      setPhotoAdjustmentPreview(null)
      dispatch(
        editorActions.commandBatchCommitted({
          commands: [
            {
              type: 'set_photo_crop',
              photoSlotId: selectedPhotoSlot.id,
              crop,
            },
            {
              type: 'set_photo_focal_point',
              photoSlotId: selectedPhotoSlot.id,
              focalPoint,
            },
          ],
          configuration,
        }),
      )
    },
    removePhoto: () => {
      if (!selectedPhotoSlot) return
      setPhotoAdjustmentPreview(null)
      commit({ type: 'remove_photo', photoSlotId: selectedPhotoSlot.id })
    },
    setBookTitle: (title: string) => {
      commit({ type: 'set_book_title', title })
    },
    swapPhoto: (secondPhotoSlotId: string) => {
      if (!selectedPhotoSlot) return
      setPhotoAdjustmentPreview(null)
      commit({
        type: 'swap_photos',
        firstPhotoSlotId: selectedPhotoSlot.id,
        secondPhotoSlotId,
      })
    },
  }
}
