import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { API_REQUEST_TIMEOUT_MS, RESOLVED_API_BASE_URL } from './config'

export const baseQuery = fetchBaseQuery({
  baseUrl: RESOLVED_API_BASE_URL,
  credentials: 'include',
  timeout: API_REQUEST_TIMEOUT_MS,
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json')
    return headers
  },
})
