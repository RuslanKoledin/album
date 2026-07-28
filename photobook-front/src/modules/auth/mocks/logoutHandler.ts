import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import { createAuthErrorResponse, waitForAuthMock } from './authMockHttp'
import {
  getMockAuthSession,
  logoutMockAuthSession,
  MOCK_AUTH_CSRF_TOKEN,
} from './authMockState'

export const logoutHandler = http.post(
  buildApiUrl('/v1/auth/logout'),
  async ({ request }) => {
    await waitForAuthMock()

    if (!getMockAuthSession().authenticated) {
      return createAuthErrorResponse(
        'AUTH_REQUIRED',
        'Войдите в аккаунт.',
        'mock-request-auth-required-401',
        401,
      )
    }
    if (request.headers.get('X-CSRF-Token') !== MOCK_AUTH_CSRF_TOKEN) {
      return createAuthErrorResponse(
        'CSRF_INVALID',
        'Сессия изменилась. Обновите страницу.',
        'mock-request-auth-csrf-403',
        403,
      )
    }

    logoutMockAuthSession()
    return new HttpResponse(null, { status: 204 })
  },
)
