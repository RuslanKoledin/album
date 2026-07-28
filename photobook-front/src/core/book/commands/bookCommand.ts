import type {
  NormalizedPoint,
  NormalizedRect,
  OpaqueId,
  PhotoSlot,
  Spread,
  TextBlock,
} from '@core/book/model'

export const BOOK_COMMAND_TYPES = [
  'set_book_title',
  'set_cover_option',
  'set_spread_layout',
  'assign_photo',
  'remove_photo',
  'set_photo_crop',
  'set_photo_focal_point',
  'swap_photos',
  'set_text',
  'remove_text',
  'add_spread',
  'remove_spread',
  'reorder_spread',
  'set_theme_option',
] as const

export type BookCommand =
  | {
      readonly type: 'set_book_title'
      readonly title: string
    }
  | {
      readonly type: 'set_cover_option'
      readonly optionId: OpaqueId
      readonly valueId: OpaqueId
    }
  | {
      readonly type: 'set_spread_layout'
      readonly spreadId: OpaqueId
      readonly layoutId: OpaqueId
      readonly photoSlots: readonly PhotoSlot[]
      readonly textBlocks: readonly TextBlock[]
    }
  | {
      readonly type: 'assign_photo'
      readonly photoSlotId: OpaqueId
      readonly assetId: OpaqueId
    }
  | {
      readonly type: 'remove_photo'
      readonly photoSlotId: OpaqueId
    }
  | {
      readonly type: 'set_photo_crop'
      readonly photoSlotId: OpaqueId
      readonly crop: NormalizedRect
    }
  | {
      readonly type: 'set_photo_focal_point'
      readonly photoSlotId: OpaqueId
      readonly focalPoint: NormalizedPoint
    }
  | {
      readonly type: 'swap_photos'
      readonly firstPhotoSlotId: OpaqueId
      readonly secondPhotoSlotId: OpaqueId
    }
  | {
      readonly type: 'set_text'
      readonly textBlockId: OpaqueId
      readonly text: string
    }
  | {
      readonly type: 'remove_text'
      readonly textBlockId: OpaqueId
    }
  | {
      readonly type: 'add_spread'
      readonly spread: Spread
      readonly index?: number
    }
  | {
      readonly type: 'remove_spread'
      readonly spreadId: OpaqueId
    }
  | {
      readonly type: 'reorder_spread'
      readonly spreadId: OpaqueId
      readonly toIndex: number
    }
  | {
      readonly type: 'set_theme_option'
      readonly themeId: OpaqueId
    }

export type BookCommandType = BookCommand['type']

type ListedBookCommandType = (typeof BOOK_COMMAND_TYPES)[number]
type BookCommandTypesAreComplete =
  Exclude<BookCommandType, ListedBookCommandType> extends never
    ? Exclude<ListedBookCommandType, BookCommandType> extends never
      ? true
      : false
    : false

const bookCommandTypesAreComplete: BookCommandTypesAreComplete = true

void bookCommandTypesAreComplete
