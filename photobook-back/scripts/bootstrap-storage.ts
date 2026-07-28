import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3'

import { loadAppConfig } from '@photobook/config'

const config = loadAppConfig()
const client = new S3Client({
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

async function bucketExists() {
  try {
    await client.send(
      new HeadBucketCommand({
        Bucket: config.storage.bucket,
      }),
    )
    return true
  } catch (error: unknown) {
    if (
      error instanceof S3ServiceException &&
      (error.$metadata.httpStatusCode === 404 ||
        error.name === 'NotFound' ||
        error.name === 'NoSuchBucket')
    ) {
      return false
    }

    throw error
  }
}

async function bootstrapStorage() {
  if (!(await bucketExists())) {
    await client.send(
      new CreateBucketCommand({
        Bucket: config.storage.bucket,
      }),
    )
  }
  process.stdout.write(`Storage bucket ${config.storage.bucket} is ready\n`)
}

bootstrapStorage()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const details =
      error instanceof S3ServiceException
        ? ` (${error.name}, HTTP ${error.$metadata.httpStatusCode ?? 'unknown'})`
        : ''
    process.stderr.write(`Storage bootstrap failed: ${message}${details}\n`)
    process.exitCode = 1
  })
  .finally(() => {
    client.destroy()
  })
