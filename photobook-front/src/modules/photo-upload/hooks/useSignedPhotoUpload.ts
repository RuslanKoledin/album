import { useEffect, useRef } from 'react'

import {
  useCompleteAssetUploadMutation,
  useRenewAssetUploadMutation,
} from '@photo-upload/api'
import { SignedUploadError, uploadSignedFile } from '@photo-upload/libs'
import type {
  PhotoUploadItem,
  PhotoUploadPhase,
  UploadInstructionDto,
} from '@photo-upload/model'

interface UseSignedPhotoUploadArgs {
  readonly csrfToken: string | null
  readonly getFile: (id: string) => File | undefined
  readonly updateItem: (
    localPhotoId: string,
    update: Partial<PhotoUploadItem>,
  ) => void
}

const getFailurePhase = (error: unknown): PhotoUploadPhase => {
  if (!(error instanceof SignedUploadError)) return 'failed'
  if (error.code === 'aborted') return 'failed'
  if (error.code === 'expired') return 'expired'
  return 'failed'
}

export function useSignedPhotoUpload({
  csrfToken,
  getFile,
  updateItem,
}: UseSignedPhotoUploadArgs) {
  const instructions = useRef(new Map<string, UploadInstructionDto>())
  const controllers = useRef(new Map<string, AbortController>())
  const cancelledIds = useRef(new Set<string>())
  const [completeUpload] = useCompleteAssetUploadMutation()
  const [renewUpload] = useRenewAssetUploadMutation()

  const upload = async (
    projectId: string,
    instruction: UploadInstructionDto,
  ) => {
    const localPhotoId = instruction.clientFileId
    if (cancelledIds.current.has(localPhotoId)) {
      updateItem(localPhotoId, { phase: 'paused', progress: 0 })
      return
    }
    const file = getFile(localPhotoId)
    if (!file || !csrfToken) {
      updateItem(localPhotoId, { phase: 'failed', progress: 0 })
      return
    }

    const controller = new AbortController()
    controllers.current.set(localPhotoId, controller)
    updateItem(localPhotoId, { phase: 'uploading', progress: 0 })
    try {
      const result = await uploadSignedFile({
        file,
        instruction,
        signal: controller.signal,
        onProgress: (progress) => updateItem(localPhotoId, { progress }),
      })
      updateItem(localPhotoId, { phase: 'confirming', progress: 100 })
      await completeUpload({
        projectId,
        assetId: instruction.assetId,
        csrfToken,
        body: { etag: result.etag, sizeBytes: file.size, sha256: null },
      }).unwrap()
      updateItem(localPhotoId, { phase: 'ready', progress: 100 })
    } catch (error) {
      const phase =
        error instanceof SignedUploadError &&
        error.code === 'aborted' &&
        cancelledIds.current.has(localPhotoId)
          ? 'paused'
          : getFailurePhase(error)
      updateItem(localPhotoId, { phase, progress: 0 })
    } finally {
      controllers.current.delete(localPhotoId)
    }
  }

  const retry = async (
    projectId: string,
    localPhotoId: string,
    phase: PhotoUploadPhase,
  ) => {
    if (!csrfToken) return
    cancelledIds.current.delete(localPhotoId)
    let instruction = instructions.current.get(localPhotoId)
    if (!instruction) return

    if (phase === 'expired') {
      try {
        instruction = await renewUpload({
          projectId,
          assetId: instruction.assetId,
          csrfToken,
        }).unwrap()
        instructions.current.set(localPhotoId, instruction)
      } catch {
        updateItem(localPhotoId, { phase: 'failed', progress: 0 })
        return
      }
    }
    await upload(projectId, instruction)
  }

  const cancel = (localPhotoId: string) => {
    cancelledIds.current.add(localPhotoId)
    controllers.current.get(localPhotoId)?.abort()
    updateItem(localPhotoId, { phase: 'paused', progress: 0 })
  }

  useEffect(
    () => () => {
      controllers.current.forEach((controller) => controller.abort())
    },
    [],
  )

  return {
    cancel,
    register: (next: readonly UploadInstructionDto[]) =>
      next.forEach((instruction) =>
        instructions.current.set(instruction.clientFileId, instruction),
      ),
    retry,
    upload,
  }
}
