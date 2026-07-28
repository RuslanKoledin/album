export type AssetMediaType = 'image/jpeg' | 'image/png'

export interface UploadFileRequest {
  readonly capturedAt: string | null
  readonly clientFileId: string
  readonly fileName: string
  readonly mediaType: AssetMediaType
  readonly sizeBytes: number
}

export interface CreateUploadBatchRequest {
  readonly files: readonly UploadFileRequest[]
}

export interface CompleteAssetUploadRequest {
  readonly etag: string
  readonly sha256: string | null
  readonly sizeBytes: number
}
