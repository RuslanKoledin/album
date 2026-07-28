import type { BookDocumentV1, BookSurface } from '@core/book'

import type { EditorElementKind, EditorState } from './editorState'

interface EditorSelectionState {
  readonly activeSurfaceId: string
  readonly selectedElementId: string | null
  readonly selectedElementKind: EditorElementKind | null
}

const getSurface = (
  document: BookDocumentV1,
  surfaceId: string,
): BookSurface | undefined =>
  surfaceId === 'cover'
    ? document.cover
    : document.spreads.find(({ id }) => id === surfaceId)

const hasSelectedElement = (
  surface: BookSurface,
  elementId: string,
  elementKind: EditorElementKind,
) =>
  elementKind === 'photo'
    ? surface.photoSlots.some(({ id }) => id === elementId)
    : surface.textBlocks.some(({ id }) => id === elementId)

export const reconcileEditorSelection = (
  state: EditorState,
  document: BookDocumentV1,
): EditorSelectionState => {
  const currentSurface = getSurface(document, state.activeSurfaceId)
  const activeSurfaceId = currentSurface
    ? state.activeSurfaceId
    : (document.spreads.at(-1)?.id ?? 'cover')
  const activeSurface = getSurface(document, activeSurfaceId)
  const keepsElementSelection = Boolean(
    activeSurface &&
    state.selectedElementId &&
    state.selectedElementKind &&
    hasSelectedElement(
      activeSurface,
      state.selectedElementId,
      state.selectedElementKind,
    ),
  )

  return {
    activeSurfaceId,
    selectedElementId: keepsElementSelection ? state.selectedElementId : null,
    selectedElementKind: keepsElementSelection
      ? state.selectedElementKind
      : null,
  }
}
