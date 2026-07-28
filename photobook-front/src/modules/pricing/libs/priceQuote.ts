import type {
  PriceQuoteConfiguration,
  PriceQuoteRequestDto,
} from '@pricing/model'

export const createPriceQuoteRequest = (
  configuration: PriceQuoteConfiguration,
): PriceQuoteRequestDto => ({
  productId: configuration.productId,
  productSpecId: configuration.productSpecId,
  catalogVersion: configuration.catalogVersion,
  spreadCount: configuration.spreadCount,
  options: configuration.optionSelections,
  quantity: 1,
  delivery: {
    method: configuration.deliveryMethod,
    city: 'Bishkek',
  },
})

export const formatKgsAmount = (amountMinor: number) =>
  new Intl.NumberFormat('ru-KG', {
    style: 'currency',
    currency: 'KGS',
    maximumFractionDigits: 0,
  }).format(amountMinor / 100)
