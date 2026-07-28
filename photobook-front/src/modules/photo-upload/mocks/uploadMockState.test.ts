import { beforeEach, describe, expect, it } from 'vitest'

import {
  completeMockUpload,
  createMockUploadBatch,
  getMockProjectAssets,
  getMockThumbnail,
  putMockUploadObject,
  renewMockUpload,
  resetPhotoUploadMockState,
} from './uploadMockState'

describe('photo upload mock lifecycle', () => {
  beforeEach(resetPhotoUploadMockState)

  it('keeps the asset identity while an expired instruction is renewed', () => {
    const request = {
      files: [
        {
          clientFileId: 'mock-local-01',
          fileName: 'expire-once-family.jpg',
          mediaType: 'image/jpeg' as const,
          sizeBytes: 4,
          capturedAt: null,
        },
      ],
    }
    const created = createMockUploadBatch(
      'mock-project-01',
      request,
      'mock-batch-key',
    )
    expect(created.kind).toBe('success')
    if (created.kind !== 'success') return

    const instruction = created.value.uploads[0]
    expect(instruction).toBeDefined()
    if (!instruction) return
    const token = new URL(instruction.uploadUrl).searchParams.get('token')
    const bytes = new Uint8Array([1, 2, 3, 4])
    expect(putMockUploadObject(instruction.assetId, token, bytes).kind).toBe(
      'expired',
    )

    const renewed = renewMockUpload('mock-project-01', instruction.assetId)
    expect(renewed.kind).toBe('success')
    if (renewed.kind !== 'success') return
    const renewedToken = new URL(renewed.value.uploadUrl).searchParams.get(
      'token',
    )
    const uploaded = putMockUploadObject(
      instruction.assetId,
      renewedToken,
      bytes,
    )
    expect(uploaded.kind).toBe('success')
    if (uploaded.kind !== 'success') return

    const completed = completeMockUpload(
      'mock-project-01',
      instruction.assetId,
      { etag: uploaded.etag, sizeBytes: 4, sha256: null },
    )
    expect(completed).toMatchObject({
      kind: 'success',
      value: { assetId: instruction.assetId, status: 'ready' },
    })
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
    expect(
      createMockUploadBatch('mock-project-01', request, 'mock-batch-key'),
    ).toEqual(created)
  })
})
