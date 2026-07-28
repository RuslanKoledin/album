import type {
  SignedUploadFailureCode,
  SignedUploadResult,
  UploadInstructionDto,
} from '@photo-upload/model'

export class SignedUploadError extends Error {
  readonly code: SignedUploadFailureCode

  constructor(code: SignedUploadFailureCode) {
    super(code)
    this.name = 'SignedUploadError'
    this.code = code
  }
}

interface UploadSignedFileArgs {
  readonly file: File
  readonly instruction: UploadInstructionDto
  readonly signal: AbortSignal
  readonly onProgress: (progress: number) => void
}

type MockStorageUploadResult =
  | { readonly kind: 'success'; readonly etag: string }
  | { readonly kind: 'expired' | 'not_found' | 'rejected' | 'size_mismatch' }

interface MockStorageUploadArgs {
  readonly assetId: string
  readonly file: File
  readonly token: string | null
}

declare global {
  var __PHOTOBOOK_MOCK_STORAGE_UPLOAD__:
    | ((args: MockStorageUploadArgs) => Promise<MockStorageUploadResult>)
    | undefined
}

const uploadMockStorageFile = async ({
  file,
  instruction,
  signal,
  onProgress,
}: UploadSignedFileArgs): Promise<SignedUploadResult> => {
  const uploadObject = globalThis.__PHOTOBOOK_MOCK_STORAGE_UPLOAD__
  if (!uploadObject) throw new SignedUploadError('network')
  if (signal.aborted) throw new SignedUploadError('aborted')

  try {
    const token = new URL(instruction.uploadUrl).searchParams.get('token')
    const result = await uploadObject({
      assetId: instruction.assetId,
      file,
      token,
    })

    if (result.kind === 'expired') {
      throw new SignedUploadError('expired')
    }
    if (result.kind !== 'success') throw new SignedUploadError('rejected')

    onProgress(100)
    return { etag: result.etag }
  } catch (error) {
    if (error instanceof SignedUploadError) throw error
    throw new SignedUploadError('network')
  }
}

export function uploadSignedFile({
  file,
  instruction,
  signal,
  onProgress,
}: UploadSignedFileArgs): Promise<SignedUploadResult> {
  if (instruction.uploadUrl.includes('/mock-storage/uploads/')) {
    return uploadMockStorageFile({ file, instruction, signal, onProgress })
  }
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    let settled = false
    const abort = () => request.abort()
    const finishWithError = (code: SignedUploadFailureCode) => {
      if (settled) return
      settled = true
      signal.removeEventListener('abort', abort)
      reject(new SignedUploadError(code))
    }

    const finishWithResponse = () => {
      if (settled || request.readyState !== XMLHttpRequest.DONE) return
      if (request.status === 401 || request.status === 403) {
        finishWithError('expired')
        return
      }
      if (request.status < 200 || request.status >= 300) {
        finishWithError('rejected')
        return
      }
      const etag =
        request.getResponseHeader('ETag') ?? request.responseText.trim()
      if (!etag) {
        finishWithError('rejected')
        return
      }
      settled = true
      signal.removeEventListener('abort', abort)
      onProgress(100)
      resolve({ etag })
    }

    request.open(instruction.method, instruction.uploadUrl)
    Object.entries(instruction.headers).forEach(([name, value]) =>
      request.setRequestHeader(name, value),
    )
    request.upload.addEventListener('progress', (event) => {
      const total = event.total || file.size
      onProgress(
        total > 0 ? Math.min(99, Math.round((event.loaded / total) * 100)) : 0,
      )
    })
    request.addEventListener('readystatechange', finishWithResponse)
    request.addEventListener('load', finishWithResponse)
    request.addEventListener('error', () => finishWithError('network'))
    request.addEventListener('abort', () =>
      finishWithError(signal.aborted ? 'aborted' : 'network'),
    )
    signal.addEventListener('abort', abort, { once: true })

    if (signal.aborted) {
      finishWithError('aborted')
      return
    }
    request.send(file)
  })
}
