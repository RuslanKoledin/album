import { delay, HttpResponse } from 'msw'

import type { ApiErrorEnvelope, ApiErrorCode } from '@shared/api'

const MOCK_AUTH_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 300

export const waitForAuthMock = () => delay(MOCK_AUTH_DELAY_MS)

export const readAuthRequestBody = async (
  request: Request,
): Promise<unknown> => {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

export const createAuthErrorResponse = (
  code: ApiErrorCode,
  message: string,
  requestId: string,
  status: number,
  retryable = false,
  headers?: HeadersInit,
) =>
  HttpResponse.json<ApiErrorEnvelope>(
    {
      error: {
        code,
        message,
        requestId,
        retryable,
        fieldErrors: [],
      },
    },
    { status, ...(headers ? { headers } : {}) },
  )
