import { http, HttpResponse } from 'msw'

import { hasAuthenticatedMockSession, hasMockOperatorAccess } from '@mocks/auth'
import { getMockOrder, getMockOrderContext } from '@mocks/order'
import { buildApiUrl } from '@shared/api'

import {
  createOperatorErrorResponse,
  waitForOperatorMock,
} from './operatorMockHttp'

export const getOperatorOrderHandler = http.get(
  buildApiUrl('/v1/admin/orders/:orderId'),
  async ({ params }) => {
    await waitForOperatorMock()
    if (!hasAuthenticatedMockSession()) {
      return createOperatorErrorResponse(
        'AUTH_REQUIRED',
        'Требуется вход.',
        'mock-operator-auth-401',
        401,
      )
    }
    if (!hasMockOperatorAccess()) {
      return createOperatorErrorResponse(
        'ACCESS_DENIED',
        'Недостаточно прав.',
        'mock-operator-access-403',
        403,
      )
    }

    const orderId = String(params.orderId)
    const order = getMockOrder(orderId)
    const context = getMockOrderContext(orderId)
    if (!order || !context) {
      return createOperatorErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Заказ не найден.',
        'mock-operator-order-404',
        404,
      )
    }

    return HttpResponse.json({
      order,
      project: context.project.project,
      approvedRevision: {
        id: context.project.latestRevision.id,
        projectId: context.project.latestRevision.projectId,
        revisionNumber: context.project.latestRevision.revisionNumber,
        documentHash: context.project.latestRevision.documentHash,
        createdAt: context.project.latestRevision.createdAt,
      },
      approval: context.approval,
      preflightRun: context.preflightRun,
    })
  },
)
