import type { ApiErrorCode } from './types'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isApiErrorCode = (value: unknown): value is ApiErrorCode => {
  switch (value) {
    case 'APPROVAL_REQUIRED':
    case 'ASSET_UPLOAD_INCOMPLETE':
    case 'AUTH_CODE_EXPIRED':
    case 'AUTH_CODE_INVALID':
    case 'AUTH_REQUIRED':
    case 'CATALOG_VERSION_UNAVAILABLE':
    case 'CLIENT_MUTATION_ID_REUSED':
    case 'CSRF_INVALID':
    case 'EXTERNAL_PROVIDER_UNAVAILABLE':
    case 'IDEMPOTENCY_KEY_REUSED':
    case 'PROJECT_REVISION_CONFLICT':
    case 'RATE_LIMITED':
    case 'RESOURCE_NOT_FOUND':
    case 'SESSION_EXPIRED':
    case 'VALIDATION_FAILED':
      return true
    default:
      return false
  }
}

export const getApiErrorCode = (value: unknown): ApiErrorCode | undefined => {
  if (!isRecord(value) || !isRecord(value.data)) return undefined

  const envelope = value.data
  if (!isRecord(envelope.error)) return undefined

  return isApiErrorCode(envelope.error.code) ? envelope.error.code : undefined
}
