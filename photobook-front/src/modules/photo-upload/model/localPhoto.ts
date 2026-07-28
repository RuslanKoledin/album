export type LocalPhotoIssueCode =
  'duplicate' | 'empty' | 'limit_exceeded' | 'too_large' | 'unsupported_type'

export interface LocalPhotoIssue {
  readonly code: LocalPhotoIssueCode
  readonly fileName: string
}

export interface LocalPhotoPreview {
  readonly fileName: string
  readonly id: string
  readonly mediaType: 'image/jpeg' | 'image/png'
  readonly previewUrl: string
  readonly sizeBytes: number
}

export interface LocalPhotoValidationResult {
  readonly accepted: readonly File[]
  readonly issues: readonly LocalPhotoIssue[]
}
