import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import { createBookHistory, type BookDocumentV1 } from '@core/book'

import type { EditorProjectSnapshot } from './mapProjectDetailToEditorProject'
import {
  initialEditorState,
  type EditorElementKind,
  type EditorState,
  type RestoreDraftPayload,
} from './editorState'

const getInitialTextSelection = (document: BookDocumentV1) => {
  const textBlock = document.cover.textBlocks[0]

  return {
    selectedElementId: textBlock?.id ?? null,
    selectedElementKind: textBlock ? ('text' as const) : null,
  }
}

export const projectLoaded: CaseReducer<
  EditorState,
  PayloadAction<EditorProjectSnapshot>
> = (_state, { payload }) => ({
  ...initialEditorState,
  projectId: payload.projectId,
  projectTitle: payload.title,
  baseRevisionId: payload.revisionId,
  history: createBookHistory(payload.document),
  ...getInitialTextSelection(payload.document),
  saveStatus: 'saved',
})

export const draftRestored: CaseReducer<
  EditorState,
  PayloadAction<RestoreDraftPayload>
> = (_state, { payload }) => ({
  ...initialEditorState,
  projectId: payload.projectId,
  projectTitle: payload.title,
  baseRevisionId: payload.baseRevisionId,
  history: createBookHistory(payload.document),
  pendingCommands: payload.pendingCommands,
  ...getInitialTextSelection(payload.document),
  saveStatus: 'dirty',
  changeVersion: 1,
  restoredFromDevice: true,
})

export const surfaceSelected: CaseReducer<
  EditorState,
  PayloadAction<string>
> = (state, { payload }) => {
  state.activeSurfaceId = payload
  state.selectedElementId = null
  state.selectedElementKind = null
}

export const elementSelected: CaseReducer<
  EditorState,
  PayloadAction<{ id: string; kind: EditorElementKind }>
> = (state, { payload }) => {
  state.selectedElementId = payload.id
  state.selectedElementKind = payload.kind
}
