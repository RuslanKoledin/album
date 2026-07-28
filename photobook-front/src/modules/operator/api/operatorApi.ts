import { baseApi } from '@shared/api'

import type { OperatorOrderDetailDto } from '@operator/model'

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Order'] as const })

export const operatorApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOperatorOrder: build.query<OperatorOrderDetailDto, string>({
      query: (orderId) => `/v1/admin/orders/${encodeURIComponent(orderId)}`,
      providesTags: (_result, _error, orderId) => [
        { type: 'Order', id: orderId },
      ],
    }),
  }),
})

export const { useGetOperatorOrderQuery } = operatorApi
