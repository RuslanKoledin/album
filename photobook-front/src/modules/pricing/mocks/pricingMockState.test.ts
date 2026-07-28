import { beforeEach, describe, expect, it } from 'vitest'

import { createMockPriceQuote, resetPricingMockState } from './pricingMockState'

const request = {
  productId: 'mock-standard-hardcover',
  productSpecId: 'mock-standard-hardcover-200x200-v0',
  catalogVersion: 'mock-catalog-v0',
  spreadCount: 3,
  options: [
    {
      optionId: 'mock-cover-material',
      valueId: 'mock-cover-material-sand',
    },
  ],
  quantity: 1 as const,
  delivery: { method: 'pickup' as const, city: 'Bishkek' as const },
}

describe('pricing mock state', () => {
  beforeEach(() => resetPricingMockState())

  it('prices the exact catalog configuration and replays it', () => {
    const created = createMockPriceQuote(request)
    const replayed = createMockPriceQuote(request)

    expect(created.kind).toBe('success')
    expect(replayed).toEqual(created)
    if (created.kind !== 'success') return
    expect(created.value.total).toEqual({
      amountMinor: 440_000,
      currency: 'KGS',
    })
    expect(created.value.items).toHaveLength(2)
  })

  it('rejects a configuration outside the catalog range', () => {
    expect(createMockPriceQuote({ ...request, spreadCount: 4 })).toEqual({
      kind: 'invalid',
    })
    expect(createMockPriceQuote({ ...request, options: [] })).toEqual({
      kind: 'invalid',
    })
  })
})
