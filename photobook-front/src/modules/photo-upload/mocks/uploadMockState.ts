import { buildApiUrl } from '@shared/api'
import { readMockSessionState, writeMockSessionState } from '@mocks/storage'

import {
  clearMockUploadBytes,
  getMockUploadBytes,
  hasMockUploadBytes,
  putMockUploadBytes,
} from './uploadMockBlobStorage'

import type {
  AssetDto,
  CompleteAssetUploadRequestDto,
  CreateUploadBatchRequestDto,
  CreateUploadBatchResponseDto,
  UploadFileRequestDto,
  UploadInstructionDto,
} from '@photo-upload/model'

interface MockUploadAsset {
  readonly projectId: string
  readonly descriptor: UploadFileRequestDto
  readonly assetId: string
  token: string
  thumbnailToken: string
  renewCount: number
  expiredOnce: boolean
  rejectedOnce: boolean
  etag: string | null
  completed: AssetDto | null
}

interface UploadBatchReplay {
  readonly fingerprint: string
  readonly response: CreateUploadBatchResponseDto
}

type StoredMockUploadAsset = MockUploadAsset & { bytes?: unknown }

let assets = new Map<string, MockUploadAsset>()
let batchReplays = new Map<string, UploadBatchReplay>()

interface UploadMockSnapshot {
  readonly assets: [string, StoredMockUploadAsset][]
  readonly batchReplays: [string, UploadBatchReplay][]
}

const clone = <T>(value: T): T => structuredClone(value)
const fingerprint = (value: unknown) => JSON.stringify(value)
const UPLOAD_MOCK_STORAGE_KEY = 'photobook:mock:uploads:v1'

const isUploadMockSnapshot = (value: unknown): value is UploadMockSnapshot => {
  if (!value || typeof value !== 'object') return false
  const snapshot = value as Record<string, unknown>

  return Array.isArray(snapshot.assets) && Array.isArray(snapshot.batchReplays)
}

const normalizeLegacyUploadBytes = (value: unknown) => {
  if (!Array.isArray(value)) return null
  if (
    !value.every((byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255)
  ) {
    return null
  }

  return new Uint8Array(value)
}

const migrateLegacyUploadBytes = (
  entries: readonly [string, StoredMockUploadAsset][],
) => {
  const migrations = entries.flatMap(([assetId, asset]) => {
    const bytes = normalizeLegacyUploadBytes(asset.bytes)
    delete asset.bytes

    return bytes ? [putMockUploadBytes(assetId, bytes)] : []
  })

  if (migrations.length === 0) return

  void Promise.allSettled(migrations).then((results) => {
    if (results.every(({ status }) => status === 'fulfilled')) {
      persistPhotoUploadMockState()
    }
  })
}

const persistPhotoUploadMockState = () => {
  writeMockSessionState(UPLOAD_MOCK_STORAGE_KEY, {
    assets: [...assets.entries()],
    batchReplays: [...batchReplays.entries()],
  } satisfies UploadMockSnapshot)
}

const restorePhotoUploadMockState = () => {
  const snapshot = readMockSessionState(UPLOAD_MOCK_STORAGE_KEY)
  if (!isUploadMockSnapshot(snapshot)) {
    resetPhotoUploadMockState()
    return
  }

  migrateLegacyUploadBytes(snapshot.assets)
  assets = new Map(snapshot.assets)
  batchReplays = new Map(snapshot.batchReplays)
}

const withoutUnavailableThumbnail = async (
  asset: MockUploadAsset,
): Promise<AssetDto> => {
  if (!asset.completed) return createPendingAsset(asset)
  if (await hasMockUploadBytes(asset.assetId)) return asset.completed

  return {
    ...asset.completed,
    status: 'uploaded',
    thumbnailUrl: null,
    thumbnailExpiresAt: null,
  }
}

const createUploadUrl = (assetId: string, token: string) => {
  const base =
    typeof location === 'undefined' ? 'http://localhost' : location.origin
  const path = buildApiUrl(
    `/mock-storage/uploads/${encodeURIComponent(assetId)}`,
  )
  const url = new URL(path, base)
  url.searchParams.set('token', token)
  return url.toString()
}

const createThumbnailUrl = (assetId: string, token: string) => {
  const base =
    typeof location === 'undefined' ? 'http://localhost' : location.origin
  const path = buildApiUrl(
    `/mock-storage/thumbnails/${encodeURIComponent(assetId)}`,
  )
  const url = new URL(path, base)
  url.searchParams.set('token', token)
  return url.toString()
}

const createPendingAsset = (asset: MockUploadAsset): AssetDto => ({
  assetId: asset.assetId,
  status: asset.etag ? 'uploaded' : 'pending_upload',
  fileName: asset.descriptor.fileName,
  mediaType: asset.descriptor.mediaType,
  sizeBytes: asset.descriptor.sizeBytes,
  pixelWidth: null,
  pixelHeight: null,
  capturedAt: asset.descriptor.capturedAt,
  thumbnailUrl: null,
  thumbnailExpiresAt: null,
  createdAt: '2026-07-22T08:40:00Z',
})

const createInstruction = (asset: MockUploadAsset): UploadInstructionDto => ({
  clientFileId: asset.descriptor.clientFileId,
  assetId: asset.assetId,
  method: 'PUT',
  uploadUrl: createUploadUrl(asset.assetId, asset.token),
  headers: { 'Content-Type': asset.descriptor.mediaType },
  expiresAt: '2026-07-22T09:00:00Z',
})

export function resetPhotoUploadMockState() {
  assets = new Map()
  batchReplays = new Map()
  persistPhotoUploadMockState()
  void clearMockUploadBytes()
}

export function createMockUploadBatch(
  projectId: string,
  request: CreateUploadBatchRequestDto,
  idempotencyKey: string,
) {
  const requestFingerprint = fingerprint({ projectId, request })
  const replay = batchReplays.get(idempotencyKey)
  if (replay) {
    return replay.fingerprint === requestFingerprint
      ? { kind: 'success' as const, value: clone(replay.response) }
      : { kind: 'key_reused' as const }
  }

  const batchNumber = batchReplays.size + 1
  const uploads = request.files.map((descriptor, index) => {
    const sequence = `${batchNumber}-${index + 1}`
    const asset: MockUploadAsset = {
      projectId,
      descriptor,
      assetId: `mock-upload-asset-${sequence}`,
      token: `mock-upload-token-${sequence}-0`,
      thumbnailToken: `mock-thumbnail-token-${sequence}`,
      renewCount: 0,
      expiredOnce: false,
      rejectedOnce: false,
      etag: null,
      completed: null,
    }
    assets.set(asset.assetId, asset)
    return createInstruction(asset)
  })
  const response: CreateUploadBatchResponseDto = {
    batchId: `mock-upload-batch-${batchNumber}`,
    uploads,
  }
  batchReplays.set(idempotencyKey, {
    fingerprint: requestFingerprint,
    response,
  })
  persistPhotoUploadMockState()
  return { kind: 'success' as const, value: clone(response) }
}

export async function putMockUploadObject(
  assetId: string,
  token: string | null,
  bytes: Uint8Array,
) {
  const asset = assets.get(assetId)
  if (!asset) return { kind: 'not_found' as const }
  if (asset.token !== token) return { kind: 'expired' as const }
  if (
    asset.descriptor.fileName.startsWith('expire-once') &&
    !asset.expiredOnce
  ) {
    asset.expiredOnce = true
    persistPhotoUploadMockState()
    return { kind: 'expired' as const }
  }
  if (
    asset.descriptor.fileName.startsWith('reject-once') &&
    !asset.rejectedOnce
  ) {
    asset.rejectedOnce = true
    persistPhotoUploadMockState()
    return { kind: 'rejected' as const }
  }
  if (asset.descriptor.sizeBytes !== bytes.byteLength) {
    return { kind: 'size_mismatch' as const }
  }

  asset.etag = `mock-etag-${asset.assetId}-${asset.renewCount}`
  await putMockUploadBytes(assetId, bytes)
  persistPhotoUploadMockState()
  return { kind: 'success' as const, etag: asset.etag }
}

export function renewMockUpload(projectId: string, assetId: string) {
  const asset = assets.get(assetId)
  if (!asset || asset.projectId !== projectId)
    return { kind: 'not_found' as const }
  if (asset.completed) return { kind: 'state_conflict' as const }

  asset.renewCount += 1
  asset.token = `mock-upload-token-${assetId}-${asset.renewCount}`
  persistPhotoUploadMockState()
  return { kind: 'success' as const, value: clone(createInstruction(asset)) }
}

export function completeMockUpload(
  projectId: string,
  assetId: string,
  request: CompleteAssetUploadRequestDto,
) {
  const asset = assets.get(assetId)
  if (!asset || asset.projectId !== projectId)
    return { kind: 'not_found' as const }
  if (asset.completed)
    return { kind: 'success' as const, value: clone(asset.completed) }
  if (!asset.etag) return { kind: 'incomplete' as const }
  if (
    request.etag !== asset.etag ||
    request.sizeBytes !== asset.descriptor.sizeBytes
  ) {
    return { kind: 'invalid' as const }
  }

  asset.completed = {
    assetId,
    status: 'ready',
    fileName: asset.descriptor.fileName,
    mediaType: asset.descriptor.mediaType,
    sizeBytes: asset.descriptor.sizeBytes,
    pixelWidth: 2400,
    pixelHeight: 1600,
    capturedAt: asset.descriptor.capturedAt,
    thumbnailUrl: createThumbnailUrl(assetId, asset.thumbnailToken),
    thumbnailExpiresAt: '2026-07-22T09:20:00Z',
    createdAt: '2026-07-22T08:40:00Z',
  }
  persistPhotoUploadMockState()
  return { kind: 'success' as const, value: clone(asset.completed) }
}

export async function getMockProjectAssets(projectId: string) {
  const projectAssets = await Promise.all(
    [...assets.values()]
      .filter((asset) => asset.projectId === projectId)
      .map(withoutUnavailableThumbnail),
  )

  return clone(projectAssets)
}

export async function getMockThumbnail(assetId: string, token: string | null) {
  const asset = assets.get(assetId)
  if (!asset?.completed) return undefined
  if (asset.thumbnailToken !== token) return undefined
  const bytes = await getMockUploadBytes(assetId)
  if (!bytes) return undefined

  return {
    bytes,
    mediaType: asset.descriptor.mediaType,
  }
}

restorePhotoUploadMockState()
