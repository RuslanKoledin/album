import { delay, HttpResponse } from 'msw'

import { MOCK_AUTH_CSRF_TOKEN } from '@mocks/auth'
import type { ApiErrorEnvelope } from '@shared/api'

const MOCK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 300
export const MOCK_STORAGE_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 700

export const waitForPhotoUploadMock = () => delay(MOCK_DELAY_MS)

export const hasValidPhotoUploadCsrfToken = (request: Request) =>
  request.headers.get('X-CSRF-Token') === MOCK_AUTH_CSRF_TOKEN

export const readPhotoUploadJson = async (
  request: Request,
): Promise<unknown> => {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

export const createPhotoUploadErrorResponse = (
  code: ApiErrorEnvelope['error']['code'],
  message: string,
  requestId: string,
  status: number,
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
      },
    },
    { status },
  )
