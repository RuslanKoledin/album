import { http, HttpResponse } from 'msw'

import { hasAuthenticatedMockSession } from '@mocks/auth'
import { buildApiUrl } from '@shared/api'

import {
  createProjectErrorResponse,
  waitForProjectMock,
} from './projectMockHttp'
import { getMockProjects } from './projectMockState'

export const getProjectsHandler = http.get(
  buildApiUrl('/v1/projects'),
  async () => {
    await waitForProjectMock()
    if (!hasAuthenticatedMockSession()) {
      return createProjectErrorResponse(
        'AUTH_REQUIRED',
        'Требуется вход.',
        'mock-project-list-auth-401',
        401,
      )
    }

    return HttpResponse.json({
      items: getMockProjects(),
      pageInfo: { nextCursor: null, hasNextPage: false },
    })
  },
)
