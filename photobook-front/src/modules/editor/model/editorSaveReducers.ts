import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import type {
  EditorState,
  SaveFailedPayload,
  SaveStartedPayload,
  SaveSucceededPayload,
} from './editorState'

export const connectionChanged: CaseReducer<
  EditorState,
  PayloadAction<boolean>
> = (state, { payload: isOnline }) => {
  if (!isOnline && state.saveStatus !== 'saved') {
    state.saveStatus = 'offline'
  } else if (isOnline && state.saveStatus === 'offline') {
    state.saveStatus = 'dirty'
  }
}

export const retrySaveRequested: CaseReducer<EditorState> = (state) => {
  if (state.saveStatus === 'error' || state.saveStatus === 'session_expired') {
    state.saveStatus = 'dirty'
    state.saveError = null
  }
}

export const saveStarted: CaseReducer<
  EditorState,
  PayloadAction<SaveStartedPayload>
> = (state, { payload }) => {
  state.activeSave = {
    clientMutationId: payload.clientMutationId,
    changeVersion: payload.changeVersion ?? state.changeVersion,
    historyDepth: payload.historyDepth ?? state.history?.past.length ?? 0,
    pendingCommandCount:
      payload.pendingCommandCount ?? state.pendingCommands.length,
  }
  state.saveStatus = 'saving'
  state.saveError = null
}

export const saveSucceeded: CaseReducer<
  EditorState,
  PayloadAction<SaveSucceededPayload>
> = (state, { payload }) => {
  if (
    state.activeSave &&
    state.activeSave.clientMutationId !== payload.clientMutationId
  ) {
    return
  }

  const savedChangeVersion =
    state.activeSave?.changeVersion ?? state.changeVersion
  const savedHistoryDepth =
    state.activeSave?.historyDepth ?? state.history?.past.length ?? 0
  const sentCommandCount =
    state.activeSave?.pendingCommandCount ?? state.pendingCommands.length

  state.baseRevisionId = payload.revisionId
  state.savedHistoryDepth = savedHistoryDepth
  state.pendingCommands = state.pendingCommands.slice(sentCommandCount)
  state.lastSavedAt = payload.savedAt
  state.activeSave = null
  state.saveStatus =
    state.changeVersion === savedChangeVersion ? 'saved' : 'dirty'
  state.saveError = null
  state.restoredFromDevice = false
}

export const saveFailed: CaseReducer<
  EditorState,
  PayloadAction<SaveFailedPayload>
> = (state, { payload }) => {
  if (
    state.activeSave &&
    state.activeSave.clientMutationId !== payload.clientMutationId
  ) {
    return
  }

  state.activeSave = null
  state.saveStatus =
    payload.kind === 'conflict'
      ? 'conflict'
      : payload.kind === 'session_expired'
        ? 'session_expired'
        : 'error'
  state.saveError = payload.message
}
