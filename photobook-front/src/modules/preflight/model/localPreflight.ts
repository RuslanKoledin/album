import type { BookDocumentValidationIssueCode } from '@core/book'

export type LocalPreflightIssueCode =
  BookDocumentValidationIssueCode | 'photo_resolution_low'

export type LocalPreflightIssueSeverity = 'error' | 'warning'

export type LocalPreflightElementKind = 'photo' | 'text'

export interface LocalPreflightIssue {
  readonly code: LocalPreflightIssueCode
  readonly effectiveDpi?: number
  readonly elementId: string | null
  readonly elementKind: LocalPreflightElementKind | null
  readonly id: string
  readonly path: string
  readonly severity: LocalPreflightIssueSeverity
  readonly spreadIndex: number | null
  readonly surfaceId: string | null
}

export interface LocalPreflightReport {
  readonly errorCount: number
  readonly isReady: boolean
  readonly issues: readonly LocalPreflightIssue[]
  readonly warningCount: number
}

export interface PhotoPixelSize {
  readonly height: number
  readonly width: number
}

export type ResolvePhotoPixelSize = (
  assetId: string,
) => PhotoPixelSize | undefined
