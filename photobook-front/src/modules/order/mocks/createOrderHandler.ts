import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import {
  createOrderErrorResponse,
  hasValidOrderCsrfToken,
  readOrderRequestBody,
  waitForOrderMock,
} from './orderMockHttp'
import { createMockOrder } from './orderMockState'
import { isCreateOrderRequest } from './orderRequestGuards'

export const createOrderHandler = http.post(
  buildApiUrl('/v1/orders'),
  async ({ request }) => {
    await waitForOrderMock()

    if (!hasValidOrderCsrfToken(request)) {
      return createOrderErrorResponse(
        'CSRF_INVALID',
        'Сессия изменилась. Обновите страницу и попробуйте снова.',
        'mock-order-csrf-403',
        403,
      )
    }

    const idempotencyKey = request.headers.get('Idempotency-Key')
    const body = await readOrderRequestBody(request)
    if (!idempotencyKey || !isCreateOrderRequest(body)) {
      return createOrderErrorResponse(
        'VALIDATION_FAILED',
        'Проверьте данные заказа.',
        'mock-order-validation-422',
        422,
      )
    }

    const result = createMockOrder(body, idempotencyKey)
    if (result.kind === 'not_found') {
      return createOrderErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Проект не найден.',
        'mock-order-project-404',
        404,
      )
    }
    if (result.kind === 'approval_required') {
      return createOrderErrorResponse(
        'APPROVAL_REQUIRED',
        'Сначала утвердите актуальную версию макета.',
        'mock-order-approval-409',
        409,
        { projectId: body.projectId },
      )
    }
    if (result.kind === 'price_quote_invalid') {
      return createOrderErrorResponse(
        'PRICE_QUOTE_INVALID',
        'Тестовый расчёт устарел. Обновите его и повторите заказ.',
        'mock-order-price-quote-409',
        409,
        { priceQuoteId: body.priceQuoteId },
        true,
      )
    }
    if (result.kind === 'key_reused') {
      return createOrderErrorResponse(
        'IDEMPOTENCY_KEY_REUSED',
        'Не удалось безопасно повторить создание заказа.',
        'mock-order-idempotency-409',
        409,
      )
    }

    return HttpResponse.json(result.value, { status: 201 })
  },
)
