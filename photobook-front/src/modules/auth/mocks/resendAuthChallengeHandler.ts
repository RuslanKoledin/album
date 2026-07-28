import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import { createAuthErrorResponse, waitForAuthMock } from './authMockHttp'
import { resendMockAuthChallenge } from './authMockState'

export const resendAuthChallengeHandler = http.post(
  buildApiUrl('/v1/auth/challenges/:challengeId/resend'),
  async ({ params }) => {
    await waitForAuthMock()
    const response = resendMockAuthChallenge(String(params.challengeId))

    if (!response) {
      return createAuthErrorResponse(
        'AUTH_CODE_EXPIRED',
        'Срок действия кода закончился.',
        'mock-request-auth-resend-expired-401',
        401,
      )
    }

    return HttpResponse.json(response)
  },
)
