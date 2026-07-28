import type {
  BookDocumentV1,
  PhotoSlot,
  Spread,
  TextBlock,
} from '@core/book/model'

export const clonePhotoSlot = (slot: PhotoSlot): PhotoSlot => ({
  ...slot,
  frameMm: { ...slot.frameMm },
  crop: { ...slot.crop },
  focalPoint: { ...slot.focalPoint },
})

export const cloneTextBlock = (textBlock: TextBlock): TextBlock => ({
  ...textBlock,
  frameMm: { ...textBlock.frameMm },
})

export const cloneSpread = (spread: Spread): Spread => ({
  ...spread,
  sizeMm: { ...spread.sizeMm },
  photoSlots: spread.photoSlots.map(clonePhotoSlot),
  textBlocks: spread.textBlocks.map(cloneTextBlock),
})

export const findPhotoSlot = (
  document: BookDocumentV1,
  photoSlotId: string,
): PhotoSlot | undefined =>
  document.cover.photoSlots.find(({ id }) => id === photoSlotId) ??
  document.spreads
    .flatMap(({ photoSlots }) => photoSlots)
    .find(({ id }) => id === photoSlotId)

export const hasTextBlock = (document: BookDocumentV1, textBlockId: string) =>
  document.cover.textBlocks.some(({ id }) => id === textBlockId) ||
  document.spreads.some(({ textBlocks }) =>
    textBlocks.some(({ id }) => id === textBlockId),
  )

export const mapPhotoSlots = (
  document: BookDocumentV1,
  transform: (slot: PhotoSlot) => PhotoSlot,
): BookDocumentV1 => ({
  ...document,
  cover: {
    ...document.cover,
    photoSlots: document.cover.photoSlots.map(transform),
  },
  spreads: document.spreads.map((spread) => ({
    ...spread,
    photoSlots: spread.photoSlots.map(transform),
  })),
})

export const mapTextBlocks = (
  document: BookDocumentV1,
  transform: (textBlock: TextBlock) => TextBlock,
): BookDocumentV1 => ({
  ...document,
  cover: {
    ...document.cover,
    textBlocks: document.cover.textBlocks.map(transform),
  },
  spreads: document.spreads.map((spread) => ({
    ...spread,
    textBlocks: spread.textBlocks.map(transform),
  })),
})
