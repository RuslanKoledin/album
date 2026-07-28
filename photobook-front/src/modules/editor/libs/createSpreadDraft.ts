import type { Spread } from '@core/book'

type SpreadEntityKind = 'spread' | 'photo-slot' | 'text-block'

interface CreateSpreadDraftInput {
  readonly copyContent: boolean
  readonly createId: (kind: SpreadEntityKind) => string
  readonly source: Spread
}

export const createSpreadDraft = ({
  copyContent,
  createId,
  source,
}: CreateSpreadDraftInput): Spread => ({
  ...source,
  id: createId('spread'),
  sizeMm: { ...source.sizeMm },
  photoSlots: source.photoSlots.map((slot) => ({
    ...slot,
    id: createId('photo-slot'),
    frameMm: { ...slot.frameMm },
    assetId: copyContent ? slot.assetId : null,
    crop: { ...slot.crop },
    focalPoint: { ...slot.focalPoint },
  })),
  textBlocks: source.textBlocks.map((textBlock) => ({
    ...textBlock,
    id: createId('text-block'),
    frameMm: { ...textBlock.frameMm },
    text: copyContent ? textBlock.text : '',
  })),
})
