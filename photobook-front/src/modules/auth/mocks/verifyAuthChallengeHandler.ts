import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import {
  createAuthErrorResponse,
  readAuthRequestBody,
  waitForAuthMock,
} from './authMockHttp'
import { isVerifyAuthChallengeRequest } from './authRequestGuards'
import { verifyMockAuthChallenge } from './authMockState'

export const verifyAuthChallengeHandler = http.post(
  buildApiUrl('/v1/auth/challenges/:challengeId/verify'),
  async ({ params, request }) => {
    await waitForAuthMock()
    const body = await readAuthRequestBody(request)

    if (!isVerifyAuthChallengeRequest(body)) {
      return createAuthErrorResponse(
        'VALIDATION_FAILED',
        'Код должен состоять из шести цифр.',
        'mock-request-auth-code-validation-422',
        422,
      )
    }

    const result = verifyMockAuthChallenge(
      String(params.challengeId),
      body.code,
    )
    if (result.kind === 'expired') {
      return createAuthErrorResponse(
        'AUTH_CODE_EXPIRED',
        'Срок действия кода закончился.',
        'mock-request-auth-expired-401',
        401,
      )
    }
    if (result.kind === 'invalid_code') {
      return createAuthErrorResponse(
        'AUTH_CODE_INVALID',
        'Код не подошёл.',
        'mock-request-auth-code-401',
        401,
      )
    }

    return HttpResponse.json(result.value)
  },
)
