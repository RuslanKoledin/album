import type { BookConfigurationBundle } from '@core/book/configuration'
import type { BookDocumentV1 } from '@core/book/model'
import { validateBookDocumentV1 } from '@core/book/validation'

import type { BookCommand } from './bookCommand'
import type { ApplyBookCommandResult } from './bookCommandApplication'
import { createBookCommandCandidate } from './createBookCommandCandidate'

const isDraftCompletenessIssue = ({ code }: { readonly code: string }) =>
  code === 'required_photo_missing' || code === 'required_text_missing'

export const applyBookCommand = (
  document: BookDocumentV1,
  command: BookCommand,
  configuration: BookConfigurationBundle,
): ApplyBookCommandResult => {
  const candidate = createBookCommandCandidate(document, command, configuration)

  if (!candidate.ok) return candidate

  const validation = validateBookDocumentV1(candidate.document, configuration)
  const blockingIssues = validation.issues.filter(
    (issue) => !isDraftCompletenessIssue(issue),
  )

  if (blockingIssues.length > 0) {
    return {
      ok: false,
      error: {
        code: 'document_invalid',
        commandType: command.type,
        issues: blockingIssues,
      },
    }
  }

  return {
    ok: true,
    document: candidate.document,
    issues: validation.issues,
  }
}
