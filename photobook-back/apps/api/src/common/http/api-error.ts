import { HttpException } from '@nestjs/common'

export type ApiErrorCode =
  | 'ACCESS_DENIED'
  | 'APPROVAL_OUTDATED'
  | 'ASSET_UPLOAD_INCOMPLETE'
  | 'AUTH_CODE_EXPIRED'
  | 'AUTH_CODE_INVALID'
  | 'AUTH_REQUIRED'
  | 'CATALOG_VERSION_UNAVAILABLE'
  | 'CLIENT_MUTATION_ID_REUSED'
  | 'CSRF_INVALID'
  | 'EXTERNAL_PROVIDER_UNAVAILABLE'
  | 'IDEMPOTENCY_KEY_REUSED'
  | 'INTERNAL_ERROR'
  | 'PROJECT_REVISION_CONFLICT'
  | 'RATE_LIMITED'
  | 'RESOURCE_NOT_FOUND'
  | 'RENDER_PROFILE_UNAVAILABLE'
  | 'SESSION_EXPIRED'
  | 'VALIDATION_FAILED'

export interface ApiFieldError {
  readonly code?: string
  readonly field: string
  readonly message: string
}

export interface ApiErrorOptions {
  readonly code: ApiErrorCode
  readonly details?: Readonly<Record<string, string>>
  readonly fieldErrors?: readonly ApiFieldError[]
  readonly message: string
  readonly retryAfterSeconds?: number
  readonly retryable?: boolean
  readonly status: number
}

export class ApiError extends HttpException {
  readonly descriptor: ApiErrorOptions

  constructor(descriptor: ApiErrorOptions) {
    super(descriptor.message, descriptor.status)
    this.descriptor = descriptor
  }
}
