import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import { createOrderErrorResponse, waitForOrderMock } from './orderMockHttp'
import { getMockOrder } from './orderMockState'

export const getOrderHandler = http.get(
  buildApiUrl('/v1/orders/:orderId'),
  async ({ params }) => {
    await waitForOrderMock()
    const order = getMockOrder(String(params.orderId))

    return order
      ? HttpResponse.json(order)
      : createOrderErrorResponse(
          'RESOURCE_NOT_FOUND',
          'Заказ не найден.',
          'mock-order-not-found-404',
          404,
        )
  },
)
