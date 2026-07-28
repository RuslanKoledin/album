import type { Asset, Prisma } from './generated/prisma/client.js'

export interface ReserveAssetInput {
  readonly assetId: string
  readonly capturedAt: Date | null
  readonly clientFileId: string
  readonly fileName: string
  readonly mediaType: string
  readonly objectKey: string
  readonly sizeBytes: number
}

export type ReserveAssetsResult =
  | { readonly kind: 'created'; readonly assets: readonly Asset[] }
  | { readonly kind: 'client_file_conflict' }
  | { readonly kind: 'limit_exceeded' }
  | { readonly kind: 'project_not_found' }

export interface CompleteAssetInput {
  readonly assetId: string
  readonly etag: string
  readonly pixelHeight: number | null
  readonly pixelWidth: number | null
  readonly sha256: string | null
  readonly sizeBytes: number
  readonly status: 'READY' | 'UPLOADED'
}

export type AssetTransactionClient = Prisma.TransactionClient
