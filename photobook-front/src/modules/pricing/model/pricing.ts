import type { ProductOptionSelection } from '@core/book'

export type PriceQuoteDeliveryMethod = 'pickup' | 'courier'

export interface PriceQuoteRequestDto {
  readonly productId: string
  readonly productSpecId: string
  readonly catalogVersion: string
  readonly spreadCount: number
  readonly options: readonly ProductOptionSelection[]
  readonly quantity: 1
  readonly delivery: {
    readonly method: PriceQuoteDeliveryMethod
    readonly city: 'Bishkek'
  }
}

export interface PriceMoneyDto {
  readonly amountMinor: number
  readonly currency: 'KGS'
}

export interface PriceQuoteItemDto {
  readonly code: 'BOOK_BASE' | 'EXTRA_SPREADS'
  readonly label: string
  readonly quantity: number
  readonly unitPrice: PriceMoneyDto
  readonly total: PriceMoneyDto
}

export interface PriceQuoteDto {
  readonly quoteId: string
  readonly expiresAt: string
  readonly items: readonly PriceQuoteItemDto[]
  readonly total: PriceMoneyDto
  readonly estimatedReadyDate: null
  readonly priceStatus: 'provisional'
}

export interface PriceQuoteConfiguration {
  readonly catalogVersion: string
  readonly deliveryMethod: PriceQuoteDeliveryMethod
  readonly optionSelections: readonly ProductOptionSelection[]
  readonly productId: string
  readonly productSpecId: string
  readonly spreadCount: number
}
