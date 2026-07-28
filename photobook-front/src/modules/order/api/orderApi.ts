import { baseApi } from '@shared/api'

import type {
  CreateOrderArgs,
  OrderDto,
  OrderListResponseDto,
} from '@order/model'

const api = baseApi.enhanceEndpoints({
  addTagTypes: ['Order', 'Project'] as const,
})

export const orderApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<OrderListResponseDto, void>({
      query: () => '/v1/orders',
      providesTags: (result) => [
        { type: 'Order', id: 'LIST' },
        ...(result?.items.map(({ id }) => ({ type: 'Order' as const, id })) ??
          []),
      ],
    }),
    createOrder: build.mutation<OrderDto, CreateOrderArgs>({
      query: ({ body, csrfToken, idempotencyKey }) => ({
        url: '/v1/orders',
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
          'Idempotency-Key': idempotencyKey,
        },
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: 'Order' as const, id: result.id },
              { type: 'Project' as const, id: result.projectId },
            ]
          : [],
    }),
    getOrder: build.query<OrderDto, string>({
      query: (orderId) => `/v1/orders/${encodeURIComponent(orderId)}`,
      providesTags: (_result, _error, orderId) => [
        { type: 'Order', id: orderId },
      ],
    }),
  }),
})

export const { useCreateOrderMutation, useGetOrderQuery, useGetOrdersQuery } =
  orderApi
