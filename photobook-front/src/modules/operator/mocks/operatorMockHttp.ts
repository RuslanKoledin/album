import { delay, HttpResponse } from 'msw'

import type { ApiErrorCode, ApiErrorEnvelope } from '@shared/api'

const MOCK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 250

export const waitForOperatorMock = () => delay(MOCK_DELAY_MS)

export const createOperatorErrorResponse = (
  code: ApiErrorCode,
  message: string,
  requestId: string,
  status: number,
) =>
  HttpResponse.json<ApiErrorEnvelope>(
    {
      error: {
        code,
        message,
        requestId,
        retryable: false,
        fieldErrors: [],
      },
    },
    { status },
  )
