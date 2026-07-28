import type {
  CompleteAssetUploadRequestDto,
  CreateUploadBatchRequestDto,
} from '@photo-upload/model'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasExactKeys = (value: UnknownRecord, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key))

const isUploadFile = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, [
    'clientFileId',
    'fileName',
    'mediaType',
    'sizeBytes',
    'capturedAt',
  ]) &&
  typeof value.clientFileId === 'string' &&
  value.clientFileId.length > 0 &&
  typeof value.fileName === 'string' &&
  value.fileName.length > 0 &&
  ['image/jpeg', 'image/png'].includes(String(value.mediaType)) &&
  Number.isInteger(value.sizeBytes) &&
  Number(value.sizeBytes) > 0 &&
  Number(value.sizeBytes) <= 25 * 1024 * 1024 &&
  (value.capturedAt === null || typeof value.capturedAt === 'string')

export const isCreateUploadBatchRequest = (
  value: unknown,
): value is CreateUploadBatchRequestDto => {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['files']) ||
    !Array.isArray(value.files) ||
    value.files.length < 1 ||
    value.files.length > 50 ||
    !value.files.every(isUploadFile)
  ) {
    return false
  }

  const ids = value.files.map((file) =>
    String((file as UnknownRecord).clientFileId),
  )
  return new Set(ids).size === ids.length
}

export const isCompleteAssetUploadRequest = (
  value: unknown,
): value is CompleteAssetUploadRequestDto =>
  isRecord(value) &&
  hasExactKeys(value, ['etag', 'sizeBytes', 'sha256']) &&
  typeof value.etag === 'string' &&
  value.etag.length > 0 &&
  Number.isInteger(value.sizeBytes) &&
  Number(value.sizeBytes) > 0 &&
  (value.sha256 === null || typeof value.sha256 === 'string')
