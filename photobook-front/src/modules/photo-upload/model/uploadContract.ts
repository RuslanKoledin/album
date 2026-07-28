export interface UploadFileRequestDto {
  readonly clientFileId: string
  readonly fileName: string
  readonly mediaType: 'image/jpeg' | 'image/png'
  readonly sizeBytes: number
  readonly capturedAt: string | null
}

export interface CreateUploadBatchRequestDto {
  readonly files: readonly UploadFileRequestDto[]
}

export interface UploadInstructionDto {
  readonly clientFileId: string
  readonly assetId: string
  readonly method: 'PUT'
  readonly uploadUrl: string
  readonly headers: Readonly<{ 'Content-Type': 'image/jpeg' | 'image/png' }>
  readonly expiresAt: string
}

export interface CreateUploadBatchResponseDto {
  readonly batchId: string
  readonly uploads: readonly UploadInstructionDto[]
}

export interface CompleteAssetUploadRequestDto {
  readonly etag: string
  readonly sizeBytes: number
  readonly sha256: string | null
}

export interface AssetDto {
  readonly assetId: string
  readonly status:
    | 'pending_upload'
    | 'uploading'
    | 'uploaded'
    | 'processing'
    | 'ready'
    | 'failed'
    | 'deleted'
  readonly fileName: string
  readonly mediaType: 'image/jpeg' | 'image/png'
  readonly sizeBytes: number
  readonly pixelWidth: number | null
  readonly pixelHeight: number | null
  readonly capturedAt: string | null
  readonly thumbnailUrl: string | null
  readonly thumbnailExpiresAt: string | null
  readonly createdAt: string
}

export interface AssetListResponseDto {
  readonly items: readonly AssetDto[]
}

export interface GetProjectAssetsArgs {
  readonly projectId: string
}

export interface CreateUploadBatchArgs {
  readonly projectId: string
  readonly csrfToken: string
  readonly idempotencyKey: string
  readonly body: CreateUploadBatchRequestDto
}

export interface CompleteAssetUploadArgs {
  readonly projectId: string
  readonly assetId: string
  readonly csrfToken: string
  readonly body: CompleteAssetUploadRequestDto
}

export interface RenewAssetUploadArgs {
  readonly projectId: string
  readonly assetId: string
  readonly csrfToken: string
}
