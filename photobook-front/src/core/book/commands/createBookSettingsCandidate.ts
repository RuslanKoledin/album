import type { BookConfigurationBundle } from '@core/book/configuration'
import type { BookDocumentV1, Spread } from '@core/book/model'

import type { BookCommand } from './bookCommand'
import type { BookCommandCandidateResult } from './bookCommandApplication'
import { targetNotFound } from './bookCommandCandidateErrors'
import { clonePhotoSlot, cloneTextBlock } from './bookDocumentTransforms'

type BookSettingsCommand = Extract<
  BookCommand,
  {
    type:
      | 'set_book_title'
      | 'set_cover_option'
      | 'set_spread_layout'
      | 'set_theme_option'
  }
>

export const createBookSettingsCandidate = (
  document: BookDocumentV1,
  command: BookSettingsCommand,
  configuration: BookConfigurationBundle,
): BookCommandCandidateResult => {
  switch (command.type) {
    case 'set_book_title':
      return {
        ok: true,
        document: {
          ...document,
          metadata: { ...document.metadata, title: command.title },
        },
      }

    case 'set_cover_option': {
      const existingIndex =
        document.productSelection.optionSelections.findIndex(
          ({ optionId }) => optionId === command.optionId,
        )
      const nextSelection = {
        optionId: command.optionId,
        valueId: command.valueId,
      }
      const optionSelections =
        existingIndex === -1
          ? [...document.productSelection.optionSelections, nextSelection]
          : document.productSelection.optionSelections.map(
              (selection, index) =>
                index === existingIndex ? nextSelection : selection,
            )

      return {
        ok: true,
        document: {
          ...document,
          productSelection: {
            ...document.productSelection,
            optionSelections,
          },
        },
      }
    }

    case 'set_spread_layout': {
      const spreadIndex = document.spreads.findIndex(
        ({ id }) => id === command.spreadId,
      )
      const currentSpread = document.spreads[spreadIndex]

      if (!currentSpread) return targetNotFound(command.type, command.spreadId)

      const targetLayout = configuration.layoutSpecs.find(
        ({ id }) => id === command.layoutId,
      )
      const replacement: Spread = {
        id: currentSpread.id,
        layoutId: command.layoutId,
        sizeMm: targetLayout
          ? { ...targetLayout.sizeMm }
          : { ...currentSpread.sizeMm },
        photoSlots: command.photoSlots.map(clonePhotoSlot),
        textBlocks: command.textBlocks.map(cloneTextBlock),
      }

      return {
        ok: true,
        document: {
          ...document,
          spreads: document.spreads.map((spread, index) =>
            index === spreadIndex ? replacement : spread,
          ),
        },
      }
    }

    case 'set_theme_option':
      return {
        ok: true,
        document: {
          ...document,
          productSelection: {
            ...document.productSelection,
            themeId: command.themeId,
          },
        },
      }
  }
}
