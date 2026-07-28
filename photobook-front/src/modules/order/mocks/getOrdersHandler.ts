import { http, HttpResponse } from 'msw'

import { hasAuthenticatedMockSession } from '@mocks/auth'
import { buildApiUrl } from '@shared/api'

import { createOrderErrorResponse, waitForOrderMock } from './orderMockHttp'
import { getMockOrders } from './orderMockState'

export const getOrdersHandler = http.get(
  buildApiUrl('/v1/orders'),
  async () => {
    await waitForOrderMock()
    if (!hasAuthenticatedMockSession()) {
      return createOrderErrorResponse(
        'AUTH_REQUIRED',
        'Требуется вход.',
        'mock-order-list-auth-401',
        401,
      )
    }

    return HttpResponse.json({
      items: getMockOrders(),
      pageInfo: { nextCursor: null, hasNextPage: false },
    })
  },
)
