import { baseApi } from '@shared/api'

import type { CatalogVersionResponseDto } from '@catalog/model'

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Catalog'] as const })

const catalogApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCatalogVersion: build.query<CatalogVersionResponseDto, string>({
      query: (catalogVersion) =>
        `/v1/catalog/versions/${encodeURIComponent(catalogVersion)}`,
      providesTags: (_result, _error, catalogVersion) => [
        { type: 'Catalog', id: catalogVersion },
      ],
    }),
  }),
})

export const { useGetCatalogVersionQuery } = catalogApi
