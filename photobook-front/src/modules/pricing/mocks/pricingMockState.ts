import { mockCatalogVersionResponse } from '@mocks/catalog'

import type { PriceQuoteDto, PriceQuoteRequestDto } from '@pricing/model'

export interface MockPriceQuoteRecord {
  readonly request: PriceQuoteRequestDto
  readonly response: PriceQuoteDto
}

let quotes = new Map<string, MockPriceQuoteRecord>()
let quoteIdsByRequest = new Map<string, string>()

const BASE_PRICE_MINOR = 350_000
const EXTRA_SPREAD_PRICE_MINOR = 45_000

const clone = <T>(value: T): T => structuredClone(value)

const isCompatibleRequest = (request: PriceQuoteRequestDto) => {
  if (request.catalogVersion !== mockCatalogVersionResponse.catalogVersion) {
    return false
  }
  const productSpec = mockCatalogVersionResponse.productSpecs.find(
    ({ id }) => id === request.productSpecId,
  )
  if (!productSpec || productSpec.productId !== request.productId) return false
  if (
    request.spreadCount < productSpec.spreadCount.min ||
    request.spreadCount > productSpec.spreadCount.max
  ) {
    return false
  }

  const selectedOptionIds = new Set(
    request.options.map(({ optionId }) => optionId),
  )
  return (
    request.options.length === productSpec.optionSpecs.length &&
    selectedOptionIds.size === request.options.length &&
    productSpec.optionSpecs.every(({ id, valueIds }) =>
      request.options.some(
        ({ optionId, valueId }) =>
          optionId === id && valueIds.includes(valueId),
      ),
    )
  )
}

const createQuoteItems = (spreadCount: number): PriceQuoteDto['items'] => {
  const extraSpreadCount = Math.max(0, spreadCount - 1)
  return [
    {
      code: 'BOOK_BASE',
      label: 'Фотокнига',
      quantity: 1,
      unitPrice: { amountMinor: BASE_PRICE_MINOR, currency: 'KGS' },
      total: { amountMinor: BASE_PRICE_MINOR, currency: 'KGS' },
    },
    ...(extraSpreadCount > 0
      ? [
          {
            code: 'EXTRA_SPREADS' as const,
            label: 'Дополнительные развороты',
            quantity: extraSpreadCount,
            unitPrice: {
              amountMinor: EXTRA_SPREAD_PRICE_MINOR,
              currency: 'KGS' as const,
            },
            total: {
              amountMinor: extraSpreadCount * EXTRA_SPREAD_PRICE_MINOR,
              currency: 'KGS' as const,
            },
          },
        ]
      : []),
  ]
}

export function createMockPriceQuote(request: PriceQuoteRequestDto) {
  if (!isCompatibleRequest(request)) return { kind: 'invalid' as const }

  const fingerprint = JSON.stringify(request)
  const existingId = quoteIdsByRequest.get(fingerprint)
  if (existingId) {
    const existing = quotes.get(existingId)
    if (existing)
      return { kind: 'success' as const, value: clone(existing.response) }
  }

  const quoteId = `mock-price-quote-${quotes.size + 1}`
  const items = createQuoteItems(request.spreadCount)
  const response: PriceQuoteDto = {
    quoteId,
    expiresAt: new Date(Date.now() + 15 * 60 * 1_000).toISOString(),
    items,
    total: {
      amountMinor: items.reduce((sum, item) => sum + item.total.amountMinor, 0),
      currency: 'KGS',
    },
    estimatedReadyDate: null,
    priceStatus: 'provisional',
  }

  quotes.set(quoteId, { request: clone(request), response })
  quoteIdsByRequest.set(fingerprint, quoteId)
  return { kind: 'success' as const, value: clone(response) }
}

export function getMockPriceQuoteRecord(quoteId: string) {
  const record = quotes.get(quoteId)
  return record ? clone(record) : undefined
}

export function resetPricingMockState() {
  quotes = new Map()
  quoteIdsByRequest = new Map()
}
