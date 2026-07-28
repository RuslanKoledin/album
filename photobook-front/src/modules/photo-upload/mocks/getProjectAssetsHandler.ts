import { http, HttpResponse } from 'msw'

import { hasAuthenticatedMockSession } from '@mocks/auth'
import { getMockProject } from '@mocks/project'
import { buildApiUrl } from '@shared/api'

import {
  createPhotoUploadErrorResponse,
  waitForPhotoUploadMock,
} from './uploadMockHttp'
import { getSeededAssetFixtures } from './seededAssetFixtures'
import { getMockProjectAssets } from './uploadMockState'

export const getProjectAssetsHandler = http.get(
  buildApiUrl('/v1/projects/:projectId/assets'),
  async ({ params }) => {
    await waitForPhotoUploadMock()
    if (!hasAuthenticatedMockSession()) {
      return createPhotoUploadErrorResponse(
        'AUTH_REQUIRED',
        'Войдите, чтобы открыть фотографии проекта.',
        'mock-assets-list-auth-401',
        401,
      )
    }

    const projectId = String(params.projectId)
    const project = getMockProject(projectId)
    if (!project) {
      return createPhotoUploadErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Проект не найден.',
        'mock-assets-list-404',
        404,
      )
    }

    const assetIds = project.latestRevision.document.assets.map(
      ({ assetId }) => assetId,
    )
    const items = [
      ...getSeededAssetFixtures(assetIds),
      ...getMockProjectAssets(projectId),
    ]

    return HttpResponse.json({ items })
  },
)
