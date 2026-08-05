import type { BookConfigurationBundle } from '@core/book/configuration'
import type { BookDocumentV1 } from '@core/book/model'

import type { BookCommand } from './bookCommand'
import type { BookCommandCandidateResult } from './bookCommandApplication'
import { createBookAssetCandidate } from './createBookAssetCandidate'
import { createBookPhotoCandidate } from './createBookPhotoCandidate'
import { createBookSettingsCandidate } from './createBookSettingsCandidate'
import { createBookSpreadCandidate } from './createBookSpreadCandidate'
import { createBookTextCandidate } from './createBookTextCandidate'

export const createBookCommandCandidate = (
  document: BookDocumentV1,
  command: BookCommand,
  configuration: BookConfigurationBundle,
): BookCommandCandidateResult => {
  switch (command.type) {
    case 'add_assets':
      return createBookAssetCandidate(document, command)

    case 'set_book_title':
    case 'set_cover_option':
    case 'set_spread_layout':
    case 'set_theme_option':
      return createBookSettingsCandidate(document, command, configuration)

    case 'assign_photo':
    case 'remove_photo':
    case 'set_photo_crop':
    case 'set_photo_focal_point':
    case 'swap_photos':
      return createBookPhotoCandidate(document, command)

    case 'set_text':
    case 'remove_text':
      return createBookTextCandidate(document, command)

    case 'add_spread':
    case 'remove_spread':
    case 'reorder_spread':
      return createBookSpreadCandidate(document, command)
  }
}
