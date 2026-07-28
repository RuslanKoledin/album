import type { BookDocumentV1 } from '@core/book/model'

import type { BookCommand } from './bookCommand'
import type { BookCommandCandidateResult } from './bookCommandApplication'
import { invalidCommand, targetNotFound } from './bookCommandCandidateErrors'
import { cloneSpread } from './bookDocumentTransforms'

type BookSpreadCommand = Extract<
  BookCommand,
  { type: 'add_spread' | 'remove_spread' | 'reorder_spread' }
>

export const createBookSpreadCandidate = (
  document: BookDocumentV1,
  command: BookSpreadCommand,
): BookCommandCandidateResult => {
  if (command.type === 'add_spread') {
    const index = command.index ?? document.spreads.length

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index > document.spreads.length
    ) {
      return invalidCommand(
        command.type,
        'index must be an insertion position within the spreads array',
      )
    }

    const spreads = [...document.spreads]
    spreads.splice(index, 0, cloneSpread(command.spread))
    return { ok: true, document: { ...document, spreads } }
  }

  const fromIndex = document.spreads.findIndex(
    ({ id }) => id === command.spreadId,
  )
  if (fromIndex === -1) return targetNotFound(command.type, command.spreadId)

  if (command.type === 'remove_spread') {
    return {
      ok: true,
      document: {
        ...document,
        spreads: document.spreads.filter(({ id }) => id !== command.spreadId),
      },
    }
  }

  if (
    !Number.isInteger(command.toIndex) ||
    command.toIndex < 0 ||
    command.toIndex >= document.spreads.length
  ) {
    return invalidCommand(
      command.type,
      'toIndex must reference an existing spread position',
    )
  }

  const spreads = [...document.spreads]
  const [spread] = spreads.splice(fromIndex, 1)
  if (!spread) return targetNotFound(command.type, command.spreadId)

  spreads.splice(command.toIndex, 0, spread)
  return { ok: true, document: { ...document, spreads } }
}
