import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('photo upload mock persistence', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    vi.resetModules()
  })

  it('restores uploaded thumbnails after the mock worker is reloaded', async () => {
    const uploadState = await import('./uploadMockState')
    const request = {
      files: [
        {
          clientFileId: 'local-photo-01',
          fileName: 'family.jpg',
          mediaType: 'image/jpeg' as const,
          sizeBytes: 4,
          capturedAt: null,
        },
      ],
    }

    uploadState.resetPhotoUploadMockState()
    const created = uploadState.createMockUploadBatch(
      'mock-project-01',
      request,
      'mock-upload-key',
    )
    expect(created.kind).toBe('success')
    if (created.kind !== 'success') return

    const instruction = created.value.uploads[0]
    expect(instruction).toBeDefined()
    if (!instruction) return

    const bytes = new Uint8Array([1, 2, 3, 4])
    const token = new URL(instruction.uploadUrl).searchParams.get('token')
    const uploaded = await uploadState.putMockUploadObject(
      instruction.assetId,
      token,
      bytes,
    )
    expect(uploaded.kind).toBe('success')
    if (uploaded.kind !== 'success') return

    const completed = uploadState.completeMockUpload(
      'mock-project-01',
      instruction.assetId,
      { etag: uploaded.etag, sizeBytes: 4, sha256: null },
    )
    expect(completed.kind).toBe('success')
    if (completed.kind !== 'success') return

    vi.resetModules()
    const restoredUploadState = await import('./uploadMockState')

    expect(
      await restoredUploadState.getMockProjectAssets('mock-project-01'),
    ).toEqual([completed.value])
    expect(completed.value.thumbnailUrl).not.toBeNull()
    if (!completed.value.thumbnailUrl) return

    expect(
      await restoredUploadState.getMockThumbnail(
        instruction.assetId,
        new URL(completed.value.thumbnailUrl).searchParams.get('token'),
      ),
    ).toEqual({ bytes, mediaType: 'image/jpeg' })
  })
})
