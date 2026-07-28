import type { BookCommandType } from './bookCommand'
import type { BookCommandCandidateResult } from './bookCommandApplication'

export const targetNotFound = (
  commandType: BookCommandType,
  targetId: string,
): BookCommandCandidateResult => ({
  ok: false,
  error: { code: 'target_not_found', commandType, targetId },
})

export const invalidCommand = (
  commandType: BookCommandType,
  message: string,
): BookCommandCandidateResult => ({
  ok: false,
  error: { code: 'invalid_command', commandType, message },
})
