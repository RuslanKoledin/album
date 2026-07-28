import type {
  BookCommand,
  BookConfigurationBundle,
  BookDocumentV1,
  BookHistory,
} from '@core/book'

export type EditorSaveStatus =
  | 'idle'
  | 'saved'
  | 'dirty'
  | 'saving'
  | 'offline'
  | 'error'
  | 'conflict'
  | 'session_expired'

export type EditorElementKind = 'photo' | 'text'

interface ActiveSave {
  readonly clientMutationId: string
  readonly changeVersion: number
  readonly historyDepth: number
  readonly pendingCommandCount: number
}

export interface EditorState {
  readonly projectId: string | null
  readonly projectTitle: string
  readonly baseRevisionId: string | null
  readonly history: BookHistory | null
  readonly savedHistoryDepth: number
  readonly pendingCommands: readonly BookCommand[]
  readonly activeSurfaceId: string
  readonly selectedElementId: string | null
  readonly selectedElementKind: EditorElementKind | null
  readonly saveStatus: EditorSaveStatus
  readonly changeVersion: number
  readonly activeSave: ActiveSave | null
  readonly lastSavedAt: string | null
  readonly commandError: string | null
  readonly saveError: string | null
  readonly restoredFromDevice: boolean
}

export const initialEditorState: EditorState = {
  projectId: null,
  projectTitle: '',
  baseRevisionId: null,
  history: null,
  savedHistoryDepth: 0,
  pendingCommands: [],
  activeSurfaceId: 'cover',
  selectedElementId: null,
  selectedElementKind: null,
  saveStatus: 'idle',
  changeVersion: 0,
  activeSave: null,
  lastSavedAt: null,
  commandError: null,
  saveError: null,
  restoredFromDevice: false,
}

export interface RestoreDraftPayload {
  readonly projectId: string
  readonly baseRevisionId: string
  readonly title: string
  readonly document: BookDocumentV1
  readonly pendingCommands: readonly BookCommand[]
}

export interface CommitCommandPayload {
  readonly command: BookCommand
  readonly configuration: BookConfigurationBundle
}

export interface CommitCommandBatchPayload {
  readonly commands: readonly BookCommand[]
  readonly configuration: BookConfigurationBundle
}

export interface SaveStartedPayload {
  readonly clientMutationId: string
  readonly changeVersion?: number
  readonly historyDepth?: number
  readonly pendingCommandCount?: number
}

export interface SaveSucceededPayload {
  readonly clientMutationId: string
  readonly revisionId: string
  readonly savedAt: string
}

export interface SaveFailedPayload {
  readonly clientMutationId: string
  readonly kind: 'request' | 'conflict' | 'session_expired'
  readonly message: string
}
