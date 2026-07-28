import { current, type CaseReducer, type PayloadAction } from '@reduxjs/toolkit'

import {
  canRedoBookHistory,
  canUndoBookHistory,
  commitBookCommandBatch,
  commitBookCommand,
  redoBookHistory,
  undoBookHistory,
  type BookHistory,
  type CommitBookCommandBatchResult,
} from '@core/book'

import type {
  CommitCommandBatchPayload,
  CommitCommandPayload,
  EditorState,
} from './editorState'
import { reconcileEditorSelection } from './reconcileEditorSelection'

type CommitError = Extract<CommitBookCommandBatchResult, { ok: false }>['error']

const getPendingCommands = (history: BookHistory, savedHistoryDepth: number) =>
  history.past
    .slice(Math.min(savedHistoryDepth, history.past.length))
    .flatMap(({ commands }) => commands)

const getCommandErrorMessage = (error: CommitError) =>
  error.code === 'command_failed' && error.cause.code === 'target_not_found'
    ? 'Не удалось применить изменение к выбранному элементу.'
    : 'Изменение нарушает правила выбранного макета.'

const applyCommittedHistory = (
  state: EditorState,
  result: Extract<CommitBookCommandBatchResult, { ok: true }>,
): EditorState => ({
  ...state,
  history: result.history,
  ...reconcileEditorSelection(state, result.history.present),
  pendingCommands: getPendingCommands(result.history, state.savedHistoryDepth),
  saveStatus: 'dirty',
  changeVersion: state.changeVersion + 1,
  commandError: null,
  saveError: null,
})

export const commandCommitted: CaseReducer<
  EditorState,
  PayloadAction<CommitCommandPayload>
> = (state, { payload }) => {
  if (!state.history) return

  const result = commitBookCommand(
    state.history,
    payload.command,
    payload.configuration,
  )

  if (!result.ok) {
    state.commandError = getCommandErrorMessage(result.error)
    return
  }

  return applyCommittedHistory(current(state), result)
}

export const commandBatchCommitted: CaseReducer<
  EditorState,
  PayloadAction<CommitCommandBatchPayload>
> = (state, { payload }) => {
  if (!state.history) return

  const result = commitBookCommandBatch(
    state.history,
    payload.commands,
    payload.configuration,
  )

  if (!result.ok) {
    state.commandError = getCommandErrorMessage(result.error)
    return
  }

  return applyCommittedHistory(current(state), result)
}

const moveHistory = (
  state: EditorState,
  history: BookHistory,
): EditorState => ({
  ...state,
  history,
  ...reconcileEditorSelection(state, history.present),
  pendingCommands: getPendingCommands(history, state.savedHistoryDepth),
  saveStatus:
    history.past.length === state.savedHistoryDepth ? 'saved' : 'dirty',
  changeVersion: state.changeVersion + 1,
  commandError: null,
})

export const undoRequested: CaseReducer<EditorState> = (state) => {
  if (!state.history || !canUndoBookHistory(state.history)) return
  return moveHistory(current(state), undoBookHistory(state.history))
}

export const redoRequested: CaseReducer<EditorState> = (state) => {
  if (!state.history || !canRedoBookHistory(state.history)) return
  return moveHistory(current(state), redoBookHistory(state.history))
}
