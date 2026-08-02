import { http, HttpResponse } from 'msw'

import { buildApiUrl } from '@shared/api'

import { getMockThumbnail } from './uploadMockState'

export const getThumbnailHandler = http.get(
  buildApiUrl('/mock-storage/thumbnails/:assetId'),
  async ({ params, request }) => {
    const token = new URL(request.url).searchParams.get('token')
    const thumbnail = await getMockThumbnail(String(params.assetId), token)

    if (!thumbnail) return new HttpResponse(null, { status: 404 })

    return new HttpResponse(thumbnail.bytes, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300',
        'Content-Type': thumbnail.mediaType,
      },
    })
  },
)
