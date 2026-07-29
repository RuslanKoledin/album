import { setupWorker } from 'msw/browser'

import { MOCK_AUTH_CSRF_TOKEN } from '@mocks/auth'
import { putMockUploadObject } from '@mocks/photo-upload'
import { setCsrfToken } from '@shared/api'

import { handlers } from './handlers'

setCsrfToken(MOCK_AUTH_CSRF_TOKEN)

globalThis.__PHOTOBOOK_MOCK_STORAGE_UPLOAD__ = async ({
  assetId,
  file,
  token,
}) =>
  putMockUploadObject(assetId, token, new Uint8Array(await file.arrayBuffer()))

export const mockWorker = setupWorker(...handlers)
