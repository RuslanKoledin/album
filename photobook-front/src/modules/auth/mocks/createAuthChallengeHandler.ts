import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import {
  createAuthErrorResponse,
  readAuthRequestBody,
  waitForAuthMock,
} from './authMockHttp'
import { isAuthChallengeRequest } from './authRequestGuards'
import { createMockAuthChallenge } from './authMockState'

export const createAuthChallengeHandler = http.post(
  buildApiUrl('/v1/auth/challenges'),
  async ({ request }) => {
    await waitForAuthMock()
    const body = await readAuthRequestBody(request)

    if (!isAuthChallengeRequest(body)) {
      return createAuthErrorResponse(
        'VALIDATION_FAILED',
        'Проверьте номер телефона.',
        'mock-request-auth-validation-422',
        422,
      )
    }

    if (body.contact.endsWith('000503')) {
      return createAuthErrorResponse(
        'EXTERNAL_PROVIDER_UNAVAILABLE',
        'Сейчас не удалось отправить код.',
        'mock-request-auth-provider-503',
        503,
        true,
      )
    }
    if (body.contact.endsWith('000429')) {
      return createAuthErrorResponse(
        'RATE_LIMITED',
        'Слишком много попыток. Попробуйте немного позже.',
        'mock-request-auth-rate-429',
        429,
        true,
        { 'Retry-After': '60' },
      )
    }

    return HttpResponse.json(createMockAuthChallenge(body.contact), {
      status: 201,
    })
  },
)
