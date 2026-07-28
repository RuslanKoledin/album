import { randomUUID } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'

import { AssetRepository, IdempotencyRepository } from '@photobook/database'
import type { Asset } from '@photobook/database'

import { ApiError } from '@api/common/http/api-error.js'
import { ContractValidationService } from '@api/common/http/contract-validation.service.js'
import { DatabaseService } from '@api/modules/database/database.service.js'
import { StorageService } from '@api/modules/storage/storage.service.js'

import { mapAsset } from './asset.mapper.js'
import type {
  CompleteAssetUploadRequest,
  CreateUploadBatchRequest,
} from './asset.types.js'
import { readImageDimensions } from './image-metadata.js'

const IDEMPOTENCY_TTL_MILLISECONDS = 24 * 60 * 60 * 1_000
const IMAGE_PROBE_BYTES = 1024 * 1024

function normalizeEtag(etag: string) {
  return etag.trim().replace(/^"|"$/g, '')
}

@Injectable()
export class AssetUploadService {
  private readonly assets: AssetRepository
  private readonly idempotency: IdempotencyRepository

  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(StorageService) private readonly storage: StorageService,
    @Inject(ContractValidationService)
    private readonly validation: ContractValidationService,
  ) {
    this.assets = new AssetRepository(this.database.client)
    this.idempotency = new IdempotencyRepository(this.database.client)
  }

  async complete(
    projectId: string,
    assetId: string,
    body: unknown,
    ownerId: string,
  ) {
    this.validation.assertHttp('completeAssetUploadRequest', body)
    const request = body as CompleteAssetUploadRequest
    const asset = await this.requireOwnedAsset(projectId, assetId, ownerId)
    this.assertExpectedCompletion(asset, request)
    if (['READY', 'UPLOADED', 'PROCESSING'].includes(asset.status)) {
      this.assertRepeatedCompletion(asset, request)
      return this.mapAndValidateAsset(asset)
    }

    const stored = await this.storage.headObject(asset.objectKey)
    if (!stored) throw this.incompleteError()
    const storedEtag = normalizeEtag(stored.ETag ?? '')
    if (
      stored.ContentLength !== Number(asset.expectedSize) ||
      stored.ContentType !== asset.mediaType ||
      !storedEtag ||
      storedEtag !== normalizeEtag(request.etag)
    ) {
      throw this.completionMismatchError()
    }
    const prefix = await this.storage.readObjectPrefix(
      asset.objectKey,
      IMAGE_PROBE_BYTES,
    )
    const dimensions = readImageDimensions(prefix, asset.mediaType)
    const completed = await this.assets.complete({
      assetId: asset.id,
      etag: storedEtag,
      pixelHeight: dimensions?.height ?? null,
      pixelWidth: dimensions?.width ?? null,
      sha256: request.sha256,
      sizeBytes: request.sizeBytes,
      status: dimensions ? 'READY' : 'UPLOADED',
    })

    return this.mapAndValidateAsset(completed)
  }

  async createBatch(
    projectId: string,
    body: unknown,
    idempotencyKey: string,
    ownerId: string,
  ) {
    this.validation.assertHttp('createUploadBatchRequest', body)
    this.assertIdempotencyKey(idempotencyKey)
    const request = body as CreateUploadBatchRequest
    this.assertUniqueClientFileIds(request)

    const result = await this.idempotency.execute({
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MILLISECONDS),
      key: idempotencyKey,
      operation: async (transaction) => {
        const batchId = randomUUID()
        const reserved = request.files.map((file) => {
          const assetId = randomUUID()
          return {
            assetId,
            capturedAt: file.capturedAt ? new Date(file.capturedAt) : null,
            clientFileId: file.clientFileId,
            fileName: file.fileName,
            mediaType: file.mediaType,
            objectKey: `projects/${projectId}/assets/${assetId}/original`,
            sizeBytes: file.sizeBytes,
          }
        })
        const created = await this.assets.reserve(
          projectId,
          ownerId,
          reserved,
          transaction,
        )
        if (created.kind === 'project_not_found') throw this.notFoundError()
        if (created.kind === 'limit_exceeded') {
          throw this.uploadValidationError(
            '/files',
            'В одном проекте можно хранить не более 50 фотографий.',
          )
        }
        if (created.kind === 'client_file_conflict') {
          throw this.uploadValidationError(
            '/files',
            'Файл с таким локальным идентификатором уже зарезервирован.',
          )
        }
        const uploads = await Promise.all(
          created.assets.map((asset) => this.createInstruction(asset)),
        )

        return { batchId, uploads }
      },
      request,
      scope: `upload-batch:create:${ownerId}:${projectId}`,
      statusCode: 201,
    })
    if (result.kind === 'conflict') {
      throw new ApiError({
        code: 'IDEMPOTENCY_KEY_REUSED',
        message: 'Этот ключ уже использован с другими данными.',
        status: 409,
      })
    }
    this.validation.assertHttp('createUploadBatchResponse', result.value)

    return result.value
  }

  async renew(projectId: string, assetId: string, ownerId: string) {
    const asset = await this.requireOwnedAsset(projectId, assetId, ownerId)
    if (!['PENDING_UPLOAD', 'UPLOADING'].includes(asset.status)) {
      throw new ApiError({
        code: 'ASSET_UPLOAD_INCOMPLETE',
        message: 'Загрузка этого файла уже завершена.',
        status: 409,
      })
    }
    const uploading = await this.assets.markUploading(asset.id)
    const response = await this.createInstruction(uploading)
    this.validation.assertHttp('uploadInstruction', response)

    return response
  }

  private assertExpectedCompletion(
    asset: Asset,
    request: CompleteAssetUploadRequest,
  ) {
    if (request.sizeBytes !== Number(asset.expectedSize)) {
      throw this.completionMismatchError()
    }
  }

  private assertIdempotencyKey(value: string) {
    if (!value || value.length > 128) {
      throw this.uploadValidationError(
        'Idempotency-Key',
        'Передайте ключ длиной от 1 до 128 символов.',
      )
    }
  }

  private assertRepeatedCompletion(
    asset: Asset,
    request: CompleteAssetUploadRequest,
  ) {
    if (
      asset.storedSize !== BigInt(request.sizeBytes) ||
      asset.etag !== normalizeEtag(request.etag) ||
      asset.sha256 !== request.sha256
    ) {
      throw this.completionMismatchError()
    }
  }

  private assertUniqueClientFileIds(request: CreateUploadBatchRequest) {
    const ids = request.files.map((file) => file.clientFileId)
    if (new Set(ids).size !== ids.length) {
      throw this.uploadValidationError(
        '/files',
        'Локальный идентификатор каждого файла должен быть уникальным.',
      )
    }
  }

  private completionMismatchError() {
    return this.uploadValidationError(
      '/',
      'Параметры загруженного файла не совпадают с резервированием.',
    )
  }

  private async createInstruction(asset: Asset) {
    const signed = await this.storage.createUploadUrl(
      asset.objectKey,
      asset.mediaType,
    )
    return {
      assetId: asset.id,
      clientFileId: asset.clientFileId,
      expiresAt: signed.expiresAt.toISOString(),
      headers: { 'Content-Type': asset.mediaType },
      method: 'PUT',
      uploadUrl: signed.url,
    }
  }

  private incompleteError() {
    return new ApiError({
      code: 'ASSET_UPLOAD_INCOMPLETE',
      message: 'Оригинал ещё не получен хранилищем.',
      retryable: true,
      status: 409,
    })
  }

  private async mapAndValidateAsset(asset: Asset) {
    const response = await mapAsset(asset, this.storage)
    this.validation.assertHttp('asset', response)
    return response
  }

  private notFoundError() {
    return new ApiError({
      code: 'RESOURCE_NOT_FOUND',
      message: 'Проект или фотография не найдены.',
      status: 404,
    })
  }

  private async requireOwnedAsset(
    projectId: string,
    assetId: string,
    ownerId: string,
  ) {
    const asset = await this.assets.findOwnedAsset(projectId, assetId, ownerId)
    if (!asset) throw this.notFoundError()
    return asset
  }

  private uploadValidationError(field: string, message: string) {
    return new ApiError({
      code: 'VALIDATION_FAILED',
      fieldErrors: [{ code: 'UPLOAD_METADATA_INVALID', field, message }],
      message: 'Не удалось подготовить загрузку фотографии.',
      status: 422,
    })
  }
}
