import { delay, HttpResponse } from 'msw'

import { MOCK_CSRF_TOKEN } from '@mocks/project'
import type { ApiErrorEnvelope } from '@shared/api'

const MOCK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 250

export const waitForOrderMock = () => delay(MOCK_DELAY_MS)

export const hasValidOrderCsrfToken = (request: Request) =>
  request.headers.get('X-CSRF-Token') === MOCK_CSRF_TOKEN

export const readOrderRequestBody = async (
  request: Request,
): Promise<unknown> => {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

export const createOrderErrorResponse = (
  code: ApiErrorEnvelope['error']['code'],
  message: string,
  requestId: string,
  status: number,
  details?: ApiErrorEnvelope['error']['details'],
  retryable = false,
) =>
  HttpResponse.json<ApiErrorEnvelope>(
    {
      error: {
        code,
        message,
        requestId,
        retryable,
        fieldErrors: [],
        ...(details ? { details } : {}),
      },
    },
    { status },
  )
