import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import {
  createProjectErrorResponse,
  hasValidProjectCsrfToken,
  readProjectRequestBody,
  waitForProjectMock,
} from './projectMockHttp'
import { saveMockProjectDocument } from './projectMockState'
import { isSaveProjectDocumentRequest } from './projectRequestGuards'

export const saveProjectDocumentHandler = http.put(
  buildApiUrl('/v1/projects/:projectId/document'),
  async ({ params, request }) => {
    await waitForProjectMock()

    if (!hasValidProjectCsrfToken(request)) {
      return createProjectErrorResponse(
        'CSRF_INVALID',
        'Сессия изменилась. Обновите страницу и попробуйте снова.',
        'mock-request-csrf-403',
        403,
      )
    }

    const projectId = String(params.projectId)
    const body = await readProjectRequestBody(request)
    if (!isSaveProjectDocumentRequest(body)) {
      return createProjectErrorResponse(
        'VALIDATION_FAILED',
        'Документ проекта имеет неверный формат.',
        'mock-request-document-invalid-422',
        422,
      )
    }

    const result = saveMockProjectDocument(projectId, body)
    if (result.kind === 'not_found') {
      return createProjectErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Проект не найден.',
        'mock-request-project-404',
        404,
        { projectId },
      )
    }
    if (result.kind === 'mutation_reused') {
      return createProjectErrorResponse(
        'CLIENT_MUTATION_ID_REUSED',
        'Не удалось безопасно повторить сохранение.',
        'mock-request-mutation-409',
        409,
      )
    }
    if (result.kind === 'revision_conflict') {
      return createProjectErrorResponse(
        'PROJECT_REVISION_CONFLICT',
        'Проект был изменён в другом окне.',
        'mock-request-revision-409',
        409,
        { latestRevisionId: result.latestRevisionId },
      )
    }

    return HttpResponse.json(result.value)
  },
)
