import type { BookDocumentV1 } from '@core/book/model'

import type { BookCommand } from './bookCommand'
import type { BookCommandCandidateResult } from './bookCommandApplication'
import { targetNotFound } from './bookCommandCandidateErrors'
import { hasTextBlock, mapTextBlocks } from './bookDocumentTransforms'

type BookTextCommand = Extract<
  BookCommand,
  { type: 'set_text' | 'remove_text' }
>

export const createBookTextCandidate = (
  document: BookDocumentV1,
  command: BookTextCommand,
): BookCommandCandidateResult => {
  if (!hasTextBlock(document, command.textBlockId)) {
    return targetNotFound(command.type, command.textBlockId)
  }

  return {
    ok: true,
    document: mapTextBlocks(document, (textBlock) =>
      textBlock.id === command.textBlockId
        ? {
            ...textBlock,
            text: command.type === 'set_text' ? command.text : '',
          }
        : textBlock,
    ),
  }
}
