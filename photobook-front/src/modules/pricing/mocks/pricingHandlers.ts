import { delay, HttpResponse, http } from 'msw'

import { buildApiUrl, type ApiErrorEnvelope } from '@shared/api'

import { createMockPriceQuote } from './pricingMockState'
import { isPriceQuoteRequest } from './pricingRequestGuards'

const MOCK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 250

const invalidQuoteError: ApiErrorEnvelope = {
  error: {
    code: 'VALIDATION_FAILED',
    message: 'Не удалось рассчитать эту конфигурацию.',
    requestId: 'mock-price-validation-422',
    retryable: false,
    fieldErrors: [],
  },
}

export const pricingHandlers = [
  http.post(buildApiUrl('/v1/price-quotes'), async ({ request }) => {
    await delay(MOCK_DELAY_MS)

    const body = await request.json().catch(() => undefined)
    if (!isPriceQuoteRequest(body)) {
      return HttpResponse.json(invalidQuoteError, { status: 422 })
    }

    const result = createMockPriceQuote(body)
    return result.kind === 'success'
      ? HttpResponse.json(result.value, { status: 201 })
      : HttpResponse.json(invalidQuoteError, { status: 422 })
  }),
]
