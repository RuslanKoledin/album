import type {
  BookDocumentV1,
  BookSurface,
  PhotoSlot,
  TextBlock,
} from '@core/book'

import type { EditorElementKind } from '@editor/model'

export interface EditorSelection {
  readonly activeSpreadIndex: number
  readonly activeSurface: BookSurface | undefined
  readonly selectedPhotoSlot: PhotoSlot | null
  readonly selectedTextBlock: TextBlock | null
}

export const getEditorSelection = (
  document: BookDocumentV1 | undefined,
  activeSurfaceId: string,
  selectedElementId: string | null,
  selectedElementKind: EditorElementKind | null,
): EditorSelection => {
  const activeSpreadIndex =
    document?.spreads.findIndex(({ id }) => id === activeSurfaceId) ?? -1
  const activeSurface =
    activeSurfaceId === 'cover'
      ? document?.cover
      : document?.spreads[activeSpreadIndex]
  const selectedTextBlock =
    selectedElementKind === 'text'
      ? (activeSurface?.textBlocks.find(({ id }) => id === selectedElementId) ??
        null)
      : null
  const selectedPhotoSlot =
    selectedElementKind === 'photo'
      ? (activeSurface?.photoSlots.find(({ id }) => id === selectedElementId) ??
        null)
      : null

  return {
    activeSpreadIndex,
    activeSurface,
    selectedPhotoSlot,
    selectedTextBlock,
  }
}
