export type PhotoUploadPhase =
  | 'queued'
  | 'uploading'
  | 'confirming'
  | 'ready'
  | 'paused'
  | 'expired'
  | 'failed'

export interface PhotoUploadItem {
  readonly assetId: string | null
  readonly localPhotoId: string
  readonly phase: PhotoUploadPhase
  readonly progress: number
}

export type SignedUploadFailureCode =
  'aborted' | 'expired' | 'network' | 'rejected'

export interface SignedUploadResult {
  readonly etag: string
}
