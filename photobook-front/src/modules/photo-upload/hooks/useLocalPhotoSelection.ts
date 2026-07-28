import { useEffect, useState } from 'react'

import {
  createLocalPhotoRegistry,
  validateLocalPhotoFiles,
  type LocalPhotoRegistry,
} from '@photo-upload/libs'
import type { LocalPhotoIssue } from '@photo-upload/model'

export function useLocalPhotoSelection() {
  const [registry] = useState<LocalPhotoRegistry>(createLocalPhotoRegistry)
  const [photoIds, setPhotoIds] = useState<readonly string[]>([])
  const [issues, setIssues] = useState<readonly LocalPhotoIssue[]>([])

  useEffect(
    () => () => {
      registry.clear()
    },
    [registry],
  )

  const addFiles = (files: readonly File[]) => {
    const result = validateLocalPhotoFiles(files, registry.getSignatures())
    const addedIds = result.accepted.flatMap((file) => {
      const preview = registry.add(file)
      return preview ? [preview.id] : []
    })

    if (addedIds.length > 0) {
      setPhotoIds((current) => [...current, ...addedIds])
    }
    setIssues(result.issues)
    return addedIds.length
  }

  const clear = () => {
    registry.clear()
    setPhotoIds([])
    setIssues([])
  }

  return {
    addFiles,
    clear,
    clearIssues: () => setIssues([]),
    getFile: (id: string) => registry.getFile(id),
    issues,
    photos: photoIds.flatMap((id) => {
      const preview = registry.getPreview(id)
      return preview ? [preview] : []
    }),
    removePhoto: (id: string) => {
      if (!registry.remove(id)) return
      setPhotoIds((current) => current.filter((photoId) => photoId !== id))
    },
  }
}
