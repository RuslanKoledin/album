import { baseApi } from '@shared/api'

import type { PriceQuoteDto, PriceQuoteRequestDto } from '@pricing/model'

const api = baseApi.enhanceEndpoints({ addTagTypes: ['PriceQuote'] as const })

const pricingApi = api.injectEndpoints({
  endpoints: (build) => ({
    createPriceQuote: build.query<PriceQuoteDto, PriceQuoteRequestDto>({
      query: (body) => ({
        url: '/v1/price-quotes',
        method: 'POST',
        body,
      }),
      providesTags: (result) =>
        result ? [{ type: 'PriceQuote', id: result.quoteId }] : [],
    }),
  }),
})

export const { useCreatePriceQuoteQuery } = pricingApi
