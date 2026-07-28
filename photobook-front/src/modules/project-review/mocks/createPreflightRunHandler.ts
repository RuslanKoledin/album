import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import {
  createProjectReviewErrorResponse,
  hasValidProjectReviewCsrfToken,
  readProjectReviewRequestBody,
  waitForProjectReviewMock,
} from './projectReviewMockHttp'
import { createMockPreflightRun } from './projectReviewMockState'
import { isPreflightRunRequest } from './projectReviewRequestGuards'

export const createPreflightRunHandler = http.post(
  buildApiUrl('/v1/projects/:projectId/preflight-runs'),
  async ({ params, request }) => {
    await waitForProjectReviewMock()

    if (!hasValidProjectReviewCsrfToken(request)) {
      return createProjectReviewErrorResponse(
        'CSRF_INVALID',
        'Сессия изменилась. Обновите страницу и попробуйте снова.',
        'mock-review-csrf-403',
        403,
      )
    }

    const body = await readProjectReviewRequestBody(request)
    if (!isPreflightRunRequest(body)) {
      return createProjectReviewErrorResponse(
        'VALIDATION_FAILED',
        'Запрос проверки макета имеет неверный формат.',
        'mock-preflight-invalid-422',
        422,
      )
    }

    const result = createMockPreflightRun(
      String(params.projectId),
      body.revisionId,
    )
    if (result.kind === 'not_found') {
      return createProjectReviewErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Проект не найден.',
        'mock-preflight-project-404',
        404,
      )
    }
    if (result.kind === 'revision_conflict') {
      return createProjectReviewErrorResponse(
        'PROJECT_REVISION_CONFLICT',
        'Макет был изменён. Откройте актуальную версию.',
        'mock-preflight-revision-409',
        409,
        { latestRevisionId: result.latestRevisionId },
      )
    }

    return HttpResponse.json(result.value, { status: 201 })
  },
)
