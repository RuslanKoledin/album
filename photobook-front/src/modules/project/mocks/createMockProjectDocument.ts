import { createMinimalBookDocumentV1Fixture } from '@mocks/book'

import type { BookDocumentV1 } from '@core/book'
import type { CreateProjectRequestDto } from '@project/model'

const SEEDED_ASSET_IDS = [
  'mock-asset-cover',
  'mock-asset-spread-01',
  'mock-asset-extra-01',
  'mock-asset-extra-02',
] as const

export const createMockProjectDocument = (
  request: CreateProjectRequestDto,
): BookDocumentV1 => {
  const document = createMinimalBookDocumentV1Fixture()
  const sourceSpread = document.spreads[0]
  if (!sourceSpread) return document

  return {
    ...document,
    productSelection: {
      ...document.productSelection,
      productId: request.productId,
      catalogVersion: request.catalogVersion,
      templateId: request.templateId,
      optionSelections: request.optionSelections,
    },
    assets: SEEDED_ASSET_IDS.map((assetId) => ({ assetId })),
    spreads: Array.from({ length: request.spreadCount }, (_, index) => {
      const spreadNumber = index + 1
      const assetId = SEEDED_ASSET_IDS[(index % 3) + 1]

      return {
        ...sourceSpread,
        id: `mock-spread-${spreadNumber.toString().padStart(2, '0')}`,
        photoSlots: sourceSpread.photoSlots.map((slot, slotIndex) => ({
          ...slot,
          id: `mock-spread-${spreadNumber}-photo-slot-${slotIndex + 1}`,
          assetId: assetId ?? 'mock-asset-spread-01',
        })),
      }
    }),
  }
}
