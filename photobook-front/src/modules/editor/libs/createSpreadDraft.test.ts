import { describe, expect, it } from 'vitest'

import { createMinimalBookDocumentV1Fixture } from '@mocks/book'

import { createSpreadDraft } from './createSpreadDraft'

const createSequentialId = () => {
  let index = 0

  return (kind: 'spread' | 'photo-slot' | 'text-block') => `${kind}-${++index}`
}

describe('createSpreadDraft', () => {
  it('creates unique entity IDs and clears content for a blank spread', () => {
    const source = createMinimalBookDocumentV1Fixture().spreads[0]
    expect(source).toBeDefined()
    if (!source) return

    const draft = createSpreadDraft({
      source,
      copyContent: false,
      createId: createSequentialId(),
    })

    expect(draft.id).toBe('spread-1')
    expect(draft.photoSlots[0]).toMatchObject({
      id: 'photo-slot-2',
      assetId: null,
    })
    expect(draft).not.toBe(source)
    expect(draft.photoSlots[0]).not.toBe(source.photoSlots[0])
  })

  it('preserves content when duplicating a spread', () => {
    const source = createMinimalBookDocumentV1Fixture().spreads[0]
    expect(source).toBeDefined()
    if (!source) return

    const duplicate = createSpreadDraft({
      source,
      copyContent: true,
      createId: createSequentialId(),
    })

    expect(duplicate.photoSlots[0]?.assetId).toBe(source.photoSlots[0]?.assetId)
  })
})
