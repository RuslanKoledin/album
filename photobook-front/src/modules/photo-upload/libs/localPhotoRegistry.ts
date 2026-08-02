import type { LocalPhotoPreview } from '@photo-upload/model'
import { createClientId } from '@shared/lib'

import {
  getLocalPhotoMediaType,
  getLocalPhotoSignature,
} from './localPhotoIdentity'

interface LocalPhotoRegistryEntry {
  readonly file: File
  readonly preview: LocalPhotoPreview
  readonly signature: string
}

export const createLocalPhotoRegistry = () => {
  const entries = new Map<string, LocalPhotoRegistryEntry>()

  const remove = (id: string) => {
    const entry = entries.get(id)
    if (!entry) return false

    URL.revokeObjectURL(entry.preview.previewUrl)
    entries.delete(id)
    return true
  }

  return {
    add(file: File) {
      const mediaType = getLocalPhotoMediaType(file)
      if (!mediaType) return null

      const id = createClientId('local-photo')
      const preview: LocalPhotoPreview = {
        fileName: file.name,
        id,
        mediaType,
        previewUrl: URL.createObjectURL(file),
        sizeBytes: file.size,
      }
      entries.set(id, {
        file,
        preview,
        signature: getLocalPhotoSignature(file),
      })
      return preview
    },
    clear() {
      entries.forEach((_entry, id) => remove(id))
    },
    getFile(id: string) {
      return entries.get(id)?.file
    },
    getPreview(id: string) {
      return entries.get(id)?.preview
    },
    getSignatures() {
      return new Set([...entries.values()].map(({ signature }) => signature))
    },
    remove,
  }
}

export type LocalPhotoRegistry = ReturnType<typeof createLocalPhotoRegistry>
