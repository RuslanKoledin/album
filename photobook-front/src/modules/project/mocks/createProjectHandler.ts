import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'
import { hasAuthenticatedMockSession } from '@mocks/auth'

import {
  createProjectErrorResponse,
  hasValidProjectCsrfToken,
  readProjectRequestBody,
  waitForProjectMock,
} from './projectMockHttp'
import { createMockProject } from './projectMockState'
import { isCreateProjectRequest } from './projectRequestGuards'

export const createProjectHandler = http.post(
  buildApiUrl('/v1/projects'),
  async ({ request }) => {
    await waitForProjectMock()

    if (!hasAuthenticatedMockSession()) {
      return createProjectErrorResponse(
        'AUTH_REQUIRED',
        'Войдите, чтобы создать проект.',
        'mock-request-auth-401',
        401,
      )
    }

    if (!hasValidProjectCsrfToken(request)) {
      return createProjectErrorResponse(
        'CSRF_INVALID',
        'Сессия изменилась. Обновите страницу и попробуйте снова.',
        'mock-request-csrf-403',
        403,
      )
    }

    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (!idempotencyKey) {
      return createProjectErrorResponse(
        'VALIDATION_FAILED',
        'Не удалось безопасно создать проект.',
        'mock-request-idempotency-missing-422',
        422,
      )
    }

    const body = await readProjectRequestBody(request)
    if (!isCreateProjectRequest(body)) {
      return createProjectErrorResponse(
        'VALIDATION_FAILED',
        'Параметры проекта заполнены неверно.',
        'mock-request-project-invalid-422',
        422,
      )
    }

    const result = createMockProject(body, idempotencyKey)
    if (result.kind === 'key_reused') {
      return createProjectErrorResponse(
        'IDEMPOTENCY_KEY_REUSED',
        'Этот ключ уже использован с другими данными.',
        'mock-request-idempotency-409',
        409,
      )
    }

    return HttpResponse.json(result.value, { status: 201 })
  },
)
