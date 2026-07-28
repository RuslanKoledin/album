import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  completeMockUpload,
  createMockUploadBatch,
  getMockProjectAssets,
  getMockThumbnail,
  putMockUploadObject,
  resetPhotoUploadMockState,
} from '@mocks/photo-upload'

import { uploadSignedFile } from './uploadSignedFile'

describe('uploadSignedFile', () => {
  beforeEach(() => {
    resetPhotoUploadMockState()
    globalThis.__PHOTOBOOK_MOCK_STORAGE_UPLOAD__ = async ({
      assetId,
      file,
      token,
    }) =>
      putMockUploadObject(
        assetId,
        token,
        new Uint8Array(await file.arrayBuffer()),
      )
  })

  afterEach(() => {
    globalThis.__PHOTOBOOK_MOCK_STORAGE_UPLOAD__ = undefined
  })

  it('stores mock uploads directly so local files stay available in the editor', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4])
    const file = new File([bytes], 'family.jpg', { type: 'image/jpeg' })
    const created = createMockUploadBatch(
      'mock-project-01',
      {
        files: [
          {
            capturedAt: null,
            clientFileId: 'local-photo-01',
            fileName: file.name,
            mediaType: 'image/jpeg',
            sizeBytes: file.size,
          },
        ],
      },
      'mock-batch-key',
    )

    expect(created.kind).toBe('success')
    if (created.kind !== 'success') return
    const instruction = created.value.uploads[0]
    expect(instruction).toBeDefined()
    if (!instruction) return

    const onProgress = vi.fn()
    const result = await uploadSignedFile({
      file,
      instruction,
      onProgress,
      signal: new AbortController().signal,
    })

    expect(result.etag).toMatch(/^mock-etag-/)
    expect(onProgress).toHaveBeenCalledWith(100)

    const completed = completeMockUpload(
      'mock-project-01',
      instruction.assetId,
      { etag: result.etag, sha256: null, sizeBytes: file.size },
    )
    expect(completed.kind).toBe('success')
    if (completed.kind !== 'success') return

    expect(getMockProjectAssets('mock-project-01')).toEqual([completed.value])
    expect(completed.value.thumbnailUrl).not.toBeNull()
    if (!completed.value.thumbnailUrl) return
    expect(
      getMockThumbnail(
        instruction.assetId,
        new URL(completed.value.thumbnailUrl).searchParams.get('token'),
      ),
    ).toEqual({ bytes, mediaType: 'image/jpeg' })
  })
})
