import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import {
  createProjectErrorResponse,
  waitForProjectMock,
} from './projectMockHttp'
import { getMockProject } from './projectMockState'

export const getProjectHandler = http.get(
  buildApiUrl('/v1/projects/:projectId'),
  async ({ params }) => {
    await waitForProjectMock()
    const projectId = String(params.projectId)
    const project = getMockProject(projectId)

    if (!project) {
      return createProjectErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Проект не найден.',
        'mock-request-project-404',
        404,
        { projectId },
      )
    }

    return HttpResponse.json(project)
  },
)
