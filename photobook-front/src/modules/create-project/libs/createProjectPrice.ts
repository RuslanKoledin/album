import type { PriceQuoteDto } from '@modules/pricing'

import { type CreatePriceEstimate } from '@create-project/model'

export const getCreatePriceEstimate = (
  quote: PriceQuoteDto | undefined,
): CreatePriceEstimate | null => {
  if (!quote) return null

  return {
    amountMinor: quote.total.amountMinor,
    currency: quote.total.currency,
    status: quote.priceStatus,
  }
}
