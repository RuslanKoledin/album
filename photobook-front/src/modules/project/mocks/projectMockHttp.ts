import { delay, HttpResponse } from 'msw'

import type { ApiErrorEnvelope } from '@shared/api'

import { MOCK_CSRF_TOKEN } from './projectFixtures'

const MOCK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 250

export const waitForProjectMock = () => delay(MOCK_DELAY_MS)

export const hasValidProjectCsrfToken = (request: Request) =>
  request.headers.get('X-CSRF-Token') === MOCK_CSRF_TOKEN

export const readProjectRequestBody = async (
  request: Request,
): Promise<unknown> => {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

export const createProjectErrorResponse = (
  code: ApiErrorEnvelope['error']['code'],
  message: string,
  requestId: string,
  status: number,
  details?: ApiErrorEnvelope['error']['details'],
) =>
  HttpResponse.json<ApiErrorEnvelope>(
    {
      error: {
        code,
        message,
        requestId,
        retryable: false,
        fieldErrors: [],
        ...(details ? { details } : {}),
      },
    },
    { status },
  )
