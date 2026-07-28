import type { LocalPhotoPreview, PhotoUploadItem } from '@photo-upload/model'

import { LocalPhotoListItem } from './LocalPhotoListItem'

interface LocalPhotoListProps {
  readonly photos: readonly LocalPhotoPreview[]
  readonly isLocked: boolean
  readonly isOnline: boolean
  readonly uploadItems: readonly PhotoUploadItem[]
  readonly onCancel: (id: string) => void
  readonly onClear: () => void
  readonly onRemove: (id: string) => void
  readonly onRetry: (id: string) => void
}

export function LocalPhotoList({
  photos,
  isLocked,
  isOnline,
  uploadItems,
  onCancel,
  onClear,
  onRemove,
  onRetry,
}: LocalPhotoListProps) {
  if (photos.length === 0) return null

  return (
    <section aria-labelledby="local-photo-list-title" className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="local-photo-list-title" className="font-semibold">
          Выбрано фотографий
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-500">{photos.length} из 50</p>
          {!isLocked ? (
            <button
              className="min-h-11 text-sm font-semibold text-danger underline"
              type="button"
              onClick={onClear}
            >
              Убрать все
            </button>
          ) : null}
        </div>
      </div>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {photos.map((photo) => (
          <LocalPhotoListItem
            isOnline={isOnline}
            key={photo.id}
            photo={photo}
            upload={uploadItems.find(
              ({ localPhotoId }) => localPhotoId === photo.id,
            )}
            onCancel={onCancel}
            onRemove={onRemove}
            onRetry={onRetry}
          />
        ))}
      </ul>
    </section>
  )
}
