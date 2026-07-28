import { createSlice } from '@reduxjs/toolkit'

import {
  commandBatchCommitted,
  commandCommitted,
  redoRequested,
  undoRequested,
} from './editorHistoryReducers'
import {
  draftRestored,
  elementSelected,
  projectLoaded,
  surfaceSelected,
} from './editorProjectReducers'
import {
  connectionChanged,
  retrySaveRequested,
  saveFailed,
  saveStarted,
  saveSucceeded,
} from './editorSaveReducers'
import { initialEditorState } from './editorState'

const editorSlice = createSlice({
  name: 'editor',
  initialState: initialEditorState,
  reducers: {
    projectLoaded,
    draftRestored,
    surfaceSelected,
    elementSelected,
    commandCommitted,
    commandBatchCommitted,
    undoRequested,
    redoRequested,
    connectionChanged,
    retrySaveRequested,
    saveStarted,
    saveSucceeded,
    saveFailed,
  },
})

export const editorActions = editorSlice.actions
export const editorReducer = editorSlice.reducer
