import type { BookConfigurationBundle } from '@core/book/configuration'
import {
  applyBookCommandBatch,
  type BookCommand,
  type BookCommandBatchApplicationError,
} from '@core/book/commands'
import type { BookDocumentV1 } from '@core/book/model'
import type { BookDocumentValidationIssue } from '@core/book/validation'

export const BOOK_HISTORY_LIMIT = 100

interface BookHistoryEntry {
  readonly commands: readonly BookCommand[]
  readonly before: BookDocumentV1
  readonly after: BookDocumentV1
}

export interface BookHistory {
  readonly present: BookDocumentV1
  readonly past: readonly BookHistoryEntry[]
  readonly future: readonly BookHistoryEntry[]
}

export type CommitBookCommandBatchResult =
  | {
      readonly ok: true
      readonly history: BookHistory
      readonly issues: readonly BookDocumentValidationIssue[]
    }
  | {
      readonly ok: false
      readonly error: BookCommandBatchApplicationError
    }

export const createBookHistory = (present: BookDocumentV1): BookHistory => ({
  present,
  past: [],
  future: [],
})

export const canUndoBookHistory = ({ past }: BookHistory) => past.length > 0

export const canRedoBookHistory = ({ future }: BookHistory) => future.length > 0

export const commitBookCommandBatch = (
  history: BookHistory,
  commands: readonly BookCommand[],
  configuration: BookConfigurationBundle,
): CommitBookCommandBatchResult => {
  const result = applyBookCommandBatch(history.present, commands, configuration)

  if (!result.ok) {
    return result
  }

  const entry: BookHistoryEntry = {
    commands: [...commands],
    before: history.present,
    after: result.document,
  }
  const past = [...history.past, entry].slice(-BOOK_HISTORY_LIMIT)

  return {
    ok: true,
    history: {
      present: result.document,
      past,
      future: [],
    },
    issues: result.issues,
  }
}

export const commitBookCommand = (
  history: BookHistory,
  command: BookCommand,
  configuration: BookConfigurationBundle,
) => commitBookCommandBatch(history, [command], configuration)

export const undoBookHistory = (history: BookHistory): BookHistory => {
  const entry = history.past.at(-1)

  if (!entry) {
    return history
  }

  return {
    present: entry.before,
    past: history.past.slice(0, -1),
    future: [entry, ...history.future],
  }
}

export const redoBookHistory = (history: BookHistory): BookHistory => {
  const entry = history.future[0]

  if (!entry) {
    return history
  }

  return {
    present: entry.after,
    past: [...history.past, entry],
    future: history.future.slice(1),
  }
}
