import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import { waitForAuthMock } from './authMockHttp'
import { getMockAuthSession } from './authMockState'

export const getAuthSessionHandler = http.get(
  buildApiUrl('/v1/auth/session'),
  async () => {
    await waitForAuthMock()
    return HttpResponse.json(getMockAuthSession())
  },
)
