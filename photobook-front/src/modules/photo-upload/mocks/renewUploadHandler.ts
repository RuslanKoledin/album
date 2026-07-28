import { http, HttpResponse } from 'msw'

import { hasAuthenticatedMockSession } from '@mocks/auth'
import { buildApiUrl } from '@shared/api'

import {
  createPhotoUploadErrorResponse,
  hasValidPhotoUploadCsrfToken,
  waitForPhotoUploadMock,
} from './uploadMockHttp'
import { renewMockUpload } from './uploadMockState'

export const renewUploadHandler = http.post(
  buildApiUrl('/v1/projects/:projectId/assets/:assetId/renew-upload'),
  async ({ params, request }) => {
    await waitForPhotoUploadMock()
    if (!hasAuthenticatedMockSession()) {
      return createPhotoUploadErrorResponse(
        'AUTH_REQUIRED',
        'Войдите, чтобы продолжить загрузку.',
        'mock-upload-renew-auth-401',
        401,
      )
    }
    if (!hasValidPhotoUploadCsrfToken(request)) {
      return createPhotoUploadErrorResponse(
        'CSRF_INVALID',
        'Сессия изменилась. Обновите страницу и попробуйте снова.',
        'mock-upload-renew-csrf-403',
        403,
      )
    }

    const result = renewMockUpload(
      String(params.projectId),
      String(params.assetId),
    )
    if (result.kind === 'not_found') {
      return createPhotoUploadErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Фотография не найдена.',
        'mock-upload-renew-404',
        404,
      )
    }
    if (result.kind === 'state_conflict') {
      return createPhotoUploadErrorResponse(
        'ASSET_UPLOAD_INCOMPLETE',
        'Загрузка уже завершена или больше недоступна.',
        'mock-upload-renew-409',
        409,
      )
    }
    return HttpResponse.json(result.value)
  },
)
