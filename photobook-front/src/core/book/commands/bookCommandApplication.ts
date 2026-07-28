import type { BookDocumentV1 } from '@core/book/model'
import type { BookDocumentValidationIssue } from '@core/book/validation'

import type { BookCommandType } from './bookCommand'

export type BookCommandApplicationError =
  | {
      readonly code: 'target_not_found'
      readonly commandType: BookCommandType
      readonly targetId: string
    }
  | {
      readonly code: 'invalid_command'
      readonly commandType: BookCommandType
      readonly message: string
    }
  | {
      readonly code: 'document_invalid'
      readonly commandType: BookCommandType
      readonly issues: readonly BookDocumentValidationIssue[]
    }

export type ApplyBookCommandResult =
  | {
      readonly ok: true
      readonly document: BookDocumentV1
      readonly issues: readonly BookDocumentValidationIssue[]
    }
  | {
      readonly ok: false
      readonly error: BookCommandApplicationError
    }

export type BookCommandCandidateResult =
  | { readonly ok: true; readonly document: BookDocumentV1 }
  | { readonly ok: false; readonly error: BookCommandApplicationError }
