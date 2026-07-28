import { http, HttpResponse } from 'msw'

import { hasAuthenticatedMockSession } from '@mocks/auth'
import { getMockProject } from '@mocks/project'
import { buildApiUrl } from '@shared/api'

import {
  createPhotoUploadErrorResponse,
  hasValidPhotoUploadCsrfToken,
  readPhotoUploadJson,
  waitForPhotoUploadMock,
} from './uploadMockHttp'
import { createMockUploadBatch } from './uploadMockState'
import { isCreateUploadBatchRequest } from './uploadRequestGuards'

export const createUploadBatchHandler = http.post(
  buildApiUrl('/v1/projects/:projectId/upload-batches'),
  async ({ params, request }) => {
    await waitForPhotoUploadMock()
    const projectId = String(params.projectId)

    if (!hasAuthenticatedMockSession()) {
      return createPhotoUploadErrorResponse(
        'AUTH_REQUIRED',
        'Войдите, чтобы загрузить фотографии.',
        'mock-upload-auth-401',
        401,
      )
    }
    if (!hasValidPhotoUploadCsrfToken(request)) {
      return createPhotoUploadErrorResponse(
        'CSRF_INVALID',
        'Сессия изменилась. Обновите страницу и попробуйте снова.',
        'mock-upload-csrf-403',
        403,
      )
    }
    if (!getMockProject(projectId)) {
      return createPhotoUploadErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Проект не найден.',
        'mock-upload-project-404',
        404,
      )
    }

    const idempotencyKey = request.headers.get('Idempotency-Key')
    const body = await readPhotoUploadJson(request)
    if (!idempotencyKey || !isCreateUploadBatchRequest(body)) {
      return createPhotoUploadErrorResponse(
        'VALIDATION_FAILED',
        'Проверьте выбранные фотографии.',
        'mock-upload-validation-422',
        422,
      )
    }

    const result = createMockUploadBatch(projectId, body, idempotencyKey)
    if (result.kind === 'key_reused') {
      return createPhotoUploadErrorResponse(
        'IDEMPOTENCY_KEY_REUSED',
        'Не удалось безопасно повторить подготовку загрузки.',
        'mock-upload-idempotency-409',
        409,
      )
    }
    return HttpResponse.json(result.value, { status: 201 })
  },
)
