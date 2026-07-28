import { delay, http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import { MOCK_STORAGE_DELAY_MS } from './uploadMockHttp'
import { putMockUploadObject } from './uploadMockState'

export const putUploadObjectHandler = http.put(
  buildApiUrl('/mock-storage/uploads/:assetId'),
  async ({ params, request }) => {
    const bytes = new Uint8Array(await request.arrayBuffer())
    await delay(MOCK_STORAGE_DELAY_MS)
    const token = new URL(request.url).searchParams.get('token')
    const result = putMockUploadObject(String(params.assetId), token, bytes)

    if (result.kind === 'not_found')
      return new HttpResponse(null, { status: 404 })
    if (result.kind === 'expired')
      return new HttpResponse(null, { status: 403 })
    if (result.kind === 'rejected')
      return new HttpResponse(null, { status: 503 })
    if (result.kind === 'size_mismatch')
      return new HttpResponse(null, { status: 422 })
    return new HttpResponse(result.etag, {
      status: 200,
      headers: {
        'Access-Control-Expose-Headers': 'ETag',
        'Content-Type': 'text/plain',
        ETag: result.etag,
      },
    })
  },
)
