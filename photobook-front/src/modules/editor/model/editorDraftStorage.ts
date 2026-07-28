import {
  BOOK_COMMAND_TYPES,
  deserializeBookDocumentV1,
  serializeBookDocumentV1,
  type BookCommand,
  type BookConfigurationBundle,
  type BookDocumentV1,
} from '@core/book'

const DRAFT_KEY_PREFIX = 'photobook.editor.draft.'

export interface EditorDraft {
  readonly projectId: string
  readonly baseRevisionId: string
  readonly document: BookDocumentV1
  readonly pendingCommands: readonly BookCommand[]
  readonly updatedAt: string
}

interface PersistedEditorDraft {
  readonly projectId: string
  readonly baseRevisionId: string
  readonly document: string
  readonly pendingCommands: readonly BookCommand[]
  readonly updatedAt: string
}

const getDraftKey = (projectId: string) => `${DRAFT_KEY_PREFIX}${projectId}`

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isBookCommand = (value: unknown): value is BookCommand =>
  isRecord(value) &&
  typeof value.type === 'string' &&
  BOOK_COMMAND_TYPES.some((type) => type === value.type)

export const writeEditorDraft = (storage: Storage, draft: EditorDraft) => {
  const persisted: PersistedEditorDraft = {
    ...draft,
    document: JSON.stringify(draft.document),
  }

  try {
    storage.setItem(getDraftKey(draft.projectId), JSON.stringify(persisted))
    return true
  } catch {
    return false
  }
}

export const readEditorDraft = (
  storage: Storage,
  projectId: string,
  configuration: BookConfigurationBundle,
): EditorDraft | null => {
  try {
    const serialized = storage.getItem(getDraftKey(projectId))
    if (!serialized) return null

    const value = JSON.parse(serialized) as unknown
    if (
      !isRecord(value) ||
      value.projectId !== projectId ||
      typeof value.baseRevisionId !== 'string' ||
      typeof value.document !== 'string' ||
      typeof value.updatedAt !== 'string' ||
      !Array.isArray(value.pendingCommands) ||
      !value.pendingCommands.every(isBookCommand)
    ) {
      return null
    }

    const document = deserializeBookDocumentV1(value.document, configuration)
    if (!document.ok) return null

    return {
      projectId,
      baseRevisionId: value.baseRevisionId,
      document: document.value,
      pendingCommands: value.pendingCommands,
      updatedAt: value.updatedAt,
    }
  } catch {
    return null
  }
}

export const persistEditorDraft = (
  storage: Storage,
  draft: EditorDraft,
  configuration: BookConfigurationBundle,
) => {
  const document = serializeBookDocumentV1(draft.document, configuration)
  if (!document.ok) return false

  const persisted: PersistedEditorDraft = {
    ...draft,
    document: document.value,
  }
  try {
    storage.setItem(getDraftKey(draft.projectId), JSON.stringify(persisted))
    return true
  } catch {
    return false
  }
}

export const clearEditorDraft = (storage: Storage, projectId: string) => {
  try {
    storage.removeItem(getDraftKey(projectId))
  } catch {
    // Storage can be unavailable in restricted browser modes.
  }
}
