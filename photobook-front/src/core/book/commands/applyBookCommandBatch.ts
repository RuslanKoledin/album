import type { BookConfigurationBundle } from '@core/book/configuration'
import type { BookDocumentV1 } from '@core/book/model'
import type { BookDocumentValidationIssue } from '@core/book/validation'
import { applyBookCommand } from './applyBookCommand'
import type { BookCommand, BookCommandType } from './bookCommand'
import type { BookCommandApplicationError } from './bookCommandApplication'

export type BookCommandBatchApplicationError =
  | {
      readonly code: 'empty_batch'
      readonly message: string
    }
  | {
      readonly code: 'command_failed'
      readonly commandIndex: number
      readonly commandType: BookCommandType
      readonly cause: BookCommandApplicationError
    }

export type ApplyBookCommandBatchResult =
  | {
      readonly ok: true
      readonly document: BookDocumentV1
      readonly issues: readonly BookDocumentValidationIssue[]
    }
  | {
      readonly ok: false
      readonly error: BookCommandBatchApplicationError
    }

export const applyBookCommandBatch = (
  document: BookDocumentV1,
  commands: readonly BookCommand[],
  configuration: BookConfigurationBundle,
): ApplyBookCommandBatchResult => {
  if (commands.length === 0) {
    return {
      ok: false,
      error: {
        code: 'empty_batch',
        message: 'A book command batch must contain at least one command',
      },
    }
  }

  let currentDocument = document
  let currentIssues: readonly BookDocumentValidationIssue[] = []

  for (const [commandIndex, command] of commands.entries()) {
    const result = applyBookCommand(currentDocument, command, configuration)

    if (!result.ok) {
      return {
        ok: false,
        error: {
          code: 'command_failed',
          commandIndex,
          commandType: command.type,
          cause: result.error,
        },
      }
    }

    currentDocument = result.document
    currentIssues = result.issues
  }

  return {
    ok: true,
    document: currentDocument,
    issues: currentIssues,
  }
}
