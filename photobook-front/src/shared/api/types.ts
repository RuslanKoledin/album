export type ApiErrorCode =
  | 'ACCESS_DENIED'
  | 'APPROVAL_REQUIRED'
  | 'ASSET_UPLOAD_INCOMPLETE'
  | 'AUTH_CODE_EXPIRED'
  | 'AUTH_CODE_INVALID'
  | 'AUTH_REQUIRED'
  | 'CATALOG_VERSION_UNAVAILABLE'
  | 'CLIENT_MUTATION_ID_REUSED'
  | 'CSRF_INVALID'
  | 'EXTERNAL_PROVIDER_UNAVAILABLE'
  | 'IDEMPOTENCY_KEY_REUSED'
  | 'PROJECT_REVISION_CONFLICT'
  | 'PRICE_QUOTE_INVALID'
  | 'RATE_LIMITED'
  | 'RESOURCE_NOT_FOUND'
  | 'SESSION_EXPIRED'
  | 'VALIDATION_FAILED'

export interface ApiFieldError {
  readonly field: string
  readonly code: string
  readonly message: string
}

export interface ApiErrorDetails {
  readonly catalogVersion?: string
  readonly projectId?: string
  readonly latestRevisionId?: string
  readonly priceQuoteId?: string
}

export interface ApiErrorEnvelope {
  readonly error: {
    readonly code: ApiErrorCode
    readonly message: string
    readonly requestId: string
    readonly retryable: boolean
    readonly fieldErrors: readonly ApiFieldError[]
    readonly details?: ApiErrorDetails
  }
}

export interface CursorPageInfoDto {
  readonly nextCursor: string | null
  readonly hasNextPage: boolean
}
