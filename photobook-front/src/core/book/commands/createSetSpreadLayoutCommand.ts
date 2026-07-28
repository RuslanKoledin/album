import type { LayoutSpec, ThemeSpec } from '@core/book/configuration'
import type { PhotoSlot, Spread, TextBlock } from '@core/book/model'

import type { BookCommand } from './bookCommand'

type SetSpreadLayoutCommand = Extract<
  BookCommand,
  { readonly type: 'set_spread_layout' }
>

interface CreateSetSpreadLayoutCommandInput {
  readonly spread: Spread
  readonly targetLayout: LayoutSpec
  readonly theme: ThemeSpec
  readonly createId: (kind: 'photo-slot' | 'text-block') => string
}

const takeMatchingItem = <
  T extends { readonly id: string; readonly layoutSlotKey: string },
>(
  items: readonly T[],
  usedIds: Set<string>,
  slotKey: string,
  isPreferred: (item: T) => boolean,
) => {
  const sameSlotItem = items.find(
    (item) =>
      !usedIds.has(item.id) &&
      item.layoutSlotKey === slotKey &&
      isPreferred(item),
  )
  const fallbackItem = items.find(
    (item) => !usedIds.has(item.id) && isPreferred(item),
  )
  const item = sameSlotItem ?? fallbackItem

  if (item) usedIds.add(item.id)
  return item
}

const createPhotoSlots = (
  spread: Spread,
  layout: LayoutSpec,
  createId: CreateSetSpreadLayoutCommandInput['createId'],
) => {
  const usedIds = new Set<string>()

  return layout.photoSlots.map((slot) => {
    const occupied = takeMatchingItem(
      spread.photoSlots,
      usedIds,
      slot.slotKey,
      ({ assetId }) => assetId !== null,
    )
    const existing =
      occupied ??
      takeMatchingItem(spread.photoSlots, usedIds, slot.slotKey, () => true)

    return {
      id: existing?.id ?? createId('photo-slot'),
      layoutSlotKey: slot.slotKey,
      frameMm: slot.frameMm,
      assetId: existing?.assetId ?? null,
      crop: existing?.crop ?? slot.defaultCrop,
      focalPoint: existing?.focalPoint ?? slot.defaultFocalPoint,
    } satisfies PhotoSlot
  })
}

const createTextBlocks = (
  spread: Spread,
  layout: LayoutSpec,
  theme: ThemeSpec,
  createId: CreateSetSpreadLayoutCommandInput['createId'],
) => {
  const usedIds = new Set<string>()
  const blocks: TextBlock[] = []

  for (const slot of layout.textSlots) {
    const style = theme.textStyles.find(
      ({ id }) => id === slot.defaultTextStyleId,
    )
    if (!style || !slot.allowedRoles.includes(style.role)) return null

    const compatibleBlocks = spread.textBlocks.filter((block) =>
      slot.allowedRoles.includes(block.role),
    )
    const nonEmpty = takeMatchingItem(
      compatibleBlocks,
      usedIds,
      slot.slotKey,
      ({ text }) => text.trim().length > 0,
    )
    const existing =
      nonEmpty ??
      takeMatchingItem(compatibleBlocks, usedIds, slot.slotKey, () => true)

    blocks.push({
      id: existing?.id ?? createId('text-block'),
      layoutSlotKey: slot.slotKey,
      frameMm: slot.frameMm,
      role: style.role,
      textStyleId: slot.defaultTextStyleId,
      text: existing?.text ?? '',
    })
  }

  return blocks
}

export const createSetSpreadLayoutCommand = ({
  spread,
  targetLayout,
  theme,
  createId,
}: CreateSetSpreadLayoutCommandInput): SetSpreadLayoutCommand | null => {
  if (targetLayout.surface !== 'spread') return null

  const textBlocks = createTextBlocks(spread, targetLayout, theme, createId)
  if (!textBlocks) return null

  return {
    type: 'set_spread_layout',
    spreadId: spread.id,
    layoutId: targetLayout.id,
    photoSlots: createPhotoSlots(spread, targetLayout, createId),
    textBlocks,
  }
}
