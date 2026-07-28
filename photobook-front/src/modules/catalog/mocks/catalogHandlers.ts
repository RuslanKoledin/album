import { HttpResponse, delay, http } from 'msw'

import { buildApiUrl, type ApiErrorEnvelope } from '@shared/api'

import { REFERENCE_CATALOG_VERSION } from '@catalog/model'
import { mockCatalogVersionResponse } from './catalogFixtures'

const MOCK_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 250

const unavailableCatalogError: ApiErrorEnvelope = {
  error: {
    code: 'CATALOG_VERSION_UNAVAILABLE',
    message: 'Версия каталога недоступна.',
    requestId: 'mock-request-catalog-404',
    retryable: false,
    fieldErrors: [],
    details: { catalogVersion: 'mock-catalog-unavailable' },
  },
}

export const catalogHandlers = [
  http.get(
    buildApiUrl('/v1/catalog/versions/:catalogVersion'),
    async ({ params }) => {
      await delay(MOCK_DELAY_MS)

      if (params.catalogVersion !== REFERENCE_CATALOG_VERSION) {
        return HttpResponse.json(unavailableCatalogError, { status: 404 })
      }

      return HttpResponse.json(mockCatalogVersionResponse)
    },
  ),
]
