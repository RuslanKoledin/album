const DEFAULT_API_BASE_URL = '/api'
const TEST_API_BASE_URL = 'http://localhost/api'

export const API_REQUEST_TIMEOUT_MS = 30_000

function normalizeApiBaseUrl(value: string | undefined) {
  const baseUrl = value?.trim()

  if (!baseUrl) return DEFAULT_API_BASE_URL
  if (baseUrl === '/') return baseUrl

  return baseUrl.replace(/\/+$/, '')
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)

export const RESOLVED_API_BASE_URL =
  import.meta.env.MODE === 'test' && API_BASE_URL === DEFAULT_API_BASE_URL
    ? TEST_API_BASE_URL
    : API_BASE_URL

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${RESOLVED_API_BASE_URL}${normalizedPath}`
}
