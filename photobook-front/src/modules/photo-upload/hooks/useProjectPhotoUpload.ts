import { useRef, useState } from 'react'

import { useCreateUploadBatchMutation } from '@photo-upload/api'
import { createUploadBatchRequest, runUploadPool } from '@photo-upload/libs'
import type { LocalPhotoPreview, PhotoUploadItem } from '@photo-upload/model'
import { createClientId } from '@shared/lib'

import { useSignedPhotoUpload } from './useSignedPhotoUpload'

interface UseProjectPhotoUploadArgs {
  readonly csrfToken: string | null
  readonly getFile: (id: string) => File | undefined
}

interface StartProjectPhotoUploadArgs {
  readonly projectId: string
  readonly photos: readonly LocalPhotoPreview[]
}

type ProjectPhotoUploadResult =
  | { readonly kind: 'ready'; readonly assetIds: readonly string[] }
  | { readonly kind: 'failed' }

const createQueueItems = (photos: readonly LocalPhotoPreview[]) =>
  photos.map<PhotoUploadItem>(({ id }) => ({
    assetId: null,
    localPhotoId: id,
    phase: 'queued',
    progress: 0,
  }))

export function useProjectPhotoUpload({
  csrfToken,
  getFile,
}: UseProjectPhotoUploadArgs) {
  const [items, setItems] = useState<readonly PhotoUploadItem[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [batchFailed, setBatchFailed] = useState(false)
  const itemsRef = useRef(items)
  const idempotency = useRef<{ fingerprint: string; key: string } | null>(null)
  const [createBatch] = useCreateUploadBatchMutation()

  const replaceItems = (next: readonly PhotoUploadItem[]) => {
    itemsRef.current = next
    setItems(next)
  }
  const reset = () => {
    idempotency.current = null
    setBatchFailed(false)
    setProjectId(null)
    replaceItems([])
  }
  const updateItem = (localPhotoId: string, update: Partial<PhotoUploadItem>) =>
    replaceItems(
      itemsRef.current.map((item) =>
        item.localPhotoId === localPhotoId ? { ...item, ...update } : item,
      ),
    )
  const signedUpload = useSignedPhotoUpload({
    csrfToken,
    getFile,
    updateItem,
  })

  const start = async ({
    projectId: nextProjectId,
    photos,
  }: StartProjectPhotoUploadArgs): Promise<ProjectPhotoUploadResult> => {
    if (!csrfToken || photos.length === 0) return { kind: 'failed' }
    const body = createUploadBatchRequest(photos)
    const fingerprint = JSON.stringify({ projectId: nextProjectId, body })
    if (idempotency.current?.fingerprint !== fingerprint) {
      idempotency.current = {
        fingerprint,
        key: createClientId('upload-batch'),
      }
    }

    setProjectId(nextProjectId)
    setBatchFailed(false)
    replaceItems(createQueueItems(photos))
    try {
      const response = await createBatch({
        projectId: nextProjectId,
        csrfToken,
        idempotencyKey: idempotency.current.key,
        body,
      }).unwrap()
      signedUpload.register(response.uploads)
      replaceItems(
        itemsRef.current.map((item) => ({
          ...item,
          assetId:
            response.uploads.find(
              ({ clientFileId }) => clientFileId === item.localPhotoId,
            )?.assetId ?? null,
        })),
      )
      await runUploadPool(response.uploads, (instruction) =>
        signedUpload.upload(nextProjectId, instruction),
      )
      const readyItems = itemsRef.current.filter(
        ({ assetId, phase }) => phase === 'ready' && assetId,
      )
      if (readyItems.length !== photos.length) return { kind: 'failed' }

      return {
        kind: 'ready',
        assetIds: readyItems.flatMap(({ assetId }) =>
          assetId ? [assetId] : [],
        ),
      }
    } catch {
      setBatchFailed(true)
      replaceItems(
        createQueueItems(photos).map((item) => ({
          ...item,
          phase: 'failed',
        })),
      )
      return { kind: 'failed' }
    }
  }

  const retry = async (localPhotoId: string) => {
    if (!projectId) return
    const item = itemsRef.current.find(
      ({ localPhotoId: id }) => id === localPhotoId,
    )
    if (item) await signedUpload.retry(projectId, localPhotoId, item.phase)
  }

  const readyCount = items.filter(({ phase }) => phase === 'ready').length
  const isBusy = items.some(({ phase }) =>
    ['queued', 'uploading', 'confirming'].includes(phase),
  )
  return {
    allReady: items.length > 0 && readyCount === items.length,
    batchFailed,
    cancel: signedUpload.cancel,
    hasStarted: projectId !== null,
    isBusy,
    items,
    projectId,
    readyCount,
    retry,
    reset,
    start,
  }
}
