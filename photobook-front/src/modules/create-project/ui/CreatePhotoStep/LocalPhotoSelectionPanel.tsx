import { FiCheckCircle, FiLock } from 'react-icons/fi'

import {
  LocalPhotoIssues,
  LocalPhotoList,
  LocalPhotoPicker,
  type LocalPhotoIssue,
  type LocalPhotoPreview,
  type PhotoUploadItem,
} from '@modules/photo-upload'

interface LocalPhotoSelectionPanelProps {
  readonly isSelected: boolean
  readonly issues: readonly LocalPhotoIssue[]
  readonly photos: readonly LocalPhotoPreview[]
  readonly isLocked: boolean
  readonly isOnline: boolean
  readonly uploadItems: readonly PhotoUploadItem[]
  readonly uploadReadyCount: number
  readonly onAddFiles: (files: readonly File[]) => void
  readonly onCancelUpload: (id: string) => void
  readonly onClear: () => void
  readonly onDismissIssues: () => void
  readonly onRemove: (id: string) => void
  readonly onRetryUpload: (id: string) => void
  readonly onSelect: () => void
}

export function LocalPhotoSelectionPanel({
  isSelected,
  issues,
  photos,
  isLocked,
  isOnline,
  uploadItems,
  uploadReadyCount,
  onAddFiles,
  onCancelUpload,
  onClear,
  onDismissIssues,
  onRemove,
  onRetryUpload,
  onSelect,
}: LocalPhotoSelectionPanelProps) {
  const hasPhotos = photos.length > 0

  return (
    <section
      className="mt-8 rounded-3xl border border-border p-5 sm:p-6"
      aria-labelledby="local-photo-title"
    >
      <div className="flex items-start gap-3">
        <FiLock aria-hidden="true" className="mt-1 shrink-0 text-accent-600" />
        <div>
          <h2 id="local-photo-title" className="font-semibold">
            Ваши фотографии
          </h2>
          <p className="mt-1 text-sm leading-6 text-ink-500">
            Здесь вы только выбираете файлы с устройства. Загрузка начнётся
            после кнопки ниже; до этого фотографии остаются только в текущей
            вкладке.
          </p>
        </div>
      </div>

      <LocalPhotoPicker
        disabled={isLocked}
        hasPhotos={hasPhotos}
        onAddFiles={onAddFiles}
      />
      <LocalPhotoIssues issues={issues} onDismiss={onDismissIssues} />
      <LocalPhotoList
        isLocked={isLocked}
        isOnline={isOnline}
        photos={photos}
        uploadItems={uploadItems}
        onCancel={onCancelUpload}
        onClear={onClear}
        onRemove={onRemove}
        onRetry={onRetryUpload}
      />

      {hasPhotos ? (
        <div
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-success-soft p-4 text-sm leading-6"
          role="status"
        >
          <span className="flex items-start gap-2">
            <FiCheckCircle
              aria-hidden="true"
              className="mt-1 shrink-0 text-success"
            />
            {isLocked
              ? `Подтверждено ${uploadReadyCount} из ${photos.length} файлов.`
              : 'Файлы проверены и готовы к загрузке.'}
          </span>
          {!isSelected ? (
            <button
              className="min-h-11 font-semibold underline"
              type="button"
              onClick={onSelect}
            >
              Использовать эти фото
            </button>
          ) : null}
        </div>
      ) : null}

      {isSelected && !hasPhotos ? (
        <p
          className="mt-5 rounded-2xl bg-warning-soft p-4 text-sm leading-6 text-ink-700"
          role="status"
        >
          Сейчас фотографии не выбраны. Добавьте их снова — настройки книги
          сохранились.
        </p>
      ) : null}
    </section>
  )
}
