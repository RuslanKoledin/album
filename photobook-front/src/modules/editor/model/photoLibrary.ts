import type { PhotoSlot } from '@core/book'

export type PhotoFilter = 'all' | 'used' | 'unused'

export interface PhotoSlotUsage {
  readonly slot: PhotoSlot
  readonly surfaceLabel: string
}
