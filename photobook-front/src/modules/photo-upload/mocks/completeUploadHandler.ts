import { http, HttpResponse } from 'msw'

import { hasAuthenticatedMockSession } from '@mocks/auth'
import { buildApiUrl } from '@shared/api'

import {
  createPhotoUploadErrorResponse,
  hasValidPhotoUploadCsrfToken,
  readPhotoUploadJson,
  waitForPhotoUploadMock,
} from './uploadMockHttp'
import { completeMockUpload } from './uploadMockState'
import { isCompleteAssetUploadRequest } from './uploadRequestGuards'

export const completeUploadHandler = http.post(
  buildApiUrl('/v1/projects/:projectId/assets/:assetId/complete'),
  async ({ params, request }) => {
    await waitForPhotoUploadMock()
    if (!hasAuthenticatedMockSession()) {
      return createPhotoUploadErrorResponse(
        'AUTH_REQUIRED',
        'Войдите, чтобы завершить загрузку.',
        'mock-upload-complete-auth-401',
        401,
      )
    }
    if (!hasValidPhotoUploadCsrfToken(request)) {
      return createPhotoUploadErrorResponse(
        'CSRF_INVALID',
        'Сессия изменилась. Обновите страницу и попробуйте снова.',
        'mock-upload-complete-csrf-403',
        403,
      )
    }

    const body = await readPhotoUploadJson(request)
    if (!isCompleteAssetUploadRequest(body)) {
      return createPhotoUploadErrorResponse(
        'VALIDATION_FAILED',
        'Данные загрузки не совпали с выбранным файлом.',
        'mock-upload-complete-validation-422',
        422,
      )
    }
    const result = completeMockUpload(
      String(params.projectId),
      String(params.assetId),
      body,
    )
    if (result.kind === 'not_found') {
      return createPhotoUploadErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Фотография не найдена.',
        'mock-upload-complete-404',
        404,
      )
    }
    if (result.kind === 'incomplete') {
      return createPhotoUploadErrorResponse(
        'ASSET_UPLOAD_INCOMPLETE',
        'Оригинал ещё не получен хранилищем.',
        'mock-upload-complete-409',
        409,
        true,
      )
    }
    if (result.kind === 'invalid') {
      return createPhotoUploadErrorResponse(
        'VALIDATION_FAILED',
        'Размер или подтверждение файла не совпали.',
        'mock-upload-complete-mismatch-422',
        422,
      )
    }
    return HttpResponse.json(result.value)
  },
)
