import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common'

import { APP_CONFIG, type AppConfig } from '@photobook/config'

@Injectable()
export class StorageService implements OnApplicationShutdown {
  private readonly bucket: string
  private readonly client: S3Client
  private readonly previewUrlTtlSeconds: number
  private readonly uploadUrlTtlSeconds: number

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.bucket = config.storage.bucket
    this.previewUrlTtlSeconds = config.storage.previewUrlTtlSeconds
    this.uploadUrlTtlSeconds = config.storage.uploadUrlTtlSeconds
    this.client = new S3Client({
      credentials: {
        accessKeyId: config.storage.accessKey,
        secretAccessKey: config.storage.secretKey,
      },
      endpoint: config.storage.endpoint,
      forcePathStyle: config.storage.forcePathStyle,
      region: config.storage.region,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
  }

  async ping() {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
  }

  async createPreviewUrl(objectKey: string) {
    const expiresAt = new Date(Date.now() + this.previewUrlTtlSeconds * 1_000)
    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      { expiresIn: this.previewUrlTtlSeconds },
    )

    return { expiresAt, url }
  }

  async createUploadUrl(objectKey: string, mediaType: string) {
    const expiresAt = new Date(Date.now() + this.uploadUrlTtlSeconds * 1_000)
    const url = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        ContentType: mediaType,
        Key: objectKey,
      }),
      { expiresIn: this.uploadUrlTtlSeconds },
    )

    return { expiresAt, url }
  }

  async deleteObject(objectKey: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: objectKey }),
    )
  }

  async headObject(objectKey: string) {
    try {
      return await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: objectKey }),
      )
    } catch (error: unknown) {
      if (
        error instanceof S3ServiceException &&
        (error.$metadata.httpStatusCode === 404 ||
          error.name === 'NotFound' ||
          error.name === 'NoSuchKey')
      ) {
        return null
      }
      throw error
    }
  }

  async readObjectPrefix(objectKey: string, maximumBytes: number) {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Range: `bytes=0-${maximumBytes - 1}`,
      }),
    )
    if (!response.Body) return new Uint8Array()

    return response.Body.transformToByteArray()
  }

  onApplicationShutdown() {
    this.client.destroy()
  }
}
