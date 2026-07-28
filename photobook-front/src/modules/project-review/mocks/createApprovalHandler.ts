import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import {
  createProjectReviewErrorResponse,
  hasValidProjectReviewCsrfToken,
  readProjectReviewRequestBody,
  waitForProjectReviewMock,
} from './projectReviewMockHttp'
import { createMockApproval } from './projectReviewMockState'
import { isCreateApprovalRequest } from './projectReviewRequestGuards'

export const createApprovalHandler = http.post(
  buildApiUrl('/v1/projects/:projectId/approvals'),
  async ({ params, request }) => {
    await waitForProjectReviewMock()

    if (!hasValidProjectReviewCsrfToken(request)) {
      return createProjectReviewErrorResponse(
        'CSRF_INVALID',
        'Сессия изменилась. Обновите страницу и попробуйте снова.',
        'mock-approval-csrf-403',
        403,
      )
    }

    const body = await readProjectReviewRequestBody(request)
    if (!isCreateApprovalRequest(body)) {
      return createProjectReviewErrorResponse(
        'VALIDATION_FAILED',
        'Проверьте подтверждения перед отправкой.',
        'mock-approval-invalid-422',
        422,
      )
    }

    const result = createMockApproval(String(params.projectId), body)
    if (result.kind === 'not_found') {
      return createProjectReviewErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Проверка макета больше недоступна.',
        'mock-approval-project-404',
        404,
      )
    }
    if (result.kind === 'revision_conflict') {
      return createProjectReviewErrorResponse(
        'PROJECT_REVISION_CONFLICT',
        'Макет был изменён. Проверьте актуальную версию.',
        'mock-approval-revision-409',
        409,
        { latestRevisionId: result.latestRevisionId },
      )
    }
    if (result.kind === 'validation_failed') {
      return createProjectReviewErrorResponse(
        'VALIDATION_FAILED',
        'Завершите проверку и подтвердите все предупреждения.',
        'mock-approval-checklist-422',
        422,
      )
    }

    return HttpResponse.json(result.value, {
      status: result.kind === 'created' ? 201 : 200,
    })
  },
)
