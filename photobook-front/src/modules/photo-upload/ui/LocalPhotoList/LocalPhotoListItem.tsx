import {
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiPauseCircle,
  FiTrash2,
} from 'react-icons/fi'

import {
  canCancelPhotoUpload,
  canRetryPhotoUpload,
  formatLocalPhotoSize,
  getPhotoUploadStatusLabel,
} from '@photo-upload/libs'
import type { LocalPhotoPreview, PhotoUploadItem } from '@photo-upload/model'

interface LocalPhotoListItemProps {
  readonly isOnline: boolean
  readonly photo: LocalPhotoPreview
  readonly upload: PhotoUploadItem | undefined
  readonly onCancel: (id: string) => void
  readonly onRemove: (id: string) => void
  readonly onRetry: (id: string) => void
}

export function LocalPhotoListItem({
  isOnline,
  photo,
  upload,
  onCancel,
  onRemove,
  onRetry,
}: LocalPhotoListItemProps) {
  const isReady = upload?.phase === 'ready'
  const isActive = upload ? canCancelPhotoUpload(upload) : false
  const isRetryable = upload ? canRetryPhotoUpload(upload) : false

  return (
    <li className="min-w-0 rounded-2xl border border-border bg-surface p-3">
      <div className="flex min-w-0 items-center gap-3">
        <img
          alt=""
          className="size-16 shrink-0 rounded-xl bg-paper-100 object-cover"
          src={photo.previewUrl}
        />
        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-sm font-semibold"
            title={photo.fileName}
          >
            {photo.fileName}
          </span>
          <span className="mt-1 block text-xs text-ink-500">
            {formatLocalPhotoSize(photo.sizeBytes)}
          </span>
        </span>
        {!upload ? (
          <button
            aria-label={`Удалить ${photo.fileName}`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-danger-soft hover:text-danger"
            type="button"
            onClick={() => onRemove(photo.id)}
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {upload ? (
        <div className="mt-3 border-t border-border pt-3" role="status">
          <div className="flex items-start gap-2 text-xs leading-5 text-ink-700">
            {isReady ? (
              <FiCheckCircle
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-success"
              />
            ) : isActive ? (
              <FiLoader
                aria-hidden="true"
                className="mt-0.5 shrink-0 animate-spin"
              />
            ) : upload.phase === 'paused' ? (
              <FiPauseCircle
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-warning"
              />
            ) : (
              <FiAlertCircle
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-warning"
              />
            )}
            <span>{getPhotoUploadStatusLabel(upload)}</span>
            {upload.phase === 'uploading' ? (
              <span className="ml-auto font-semibold">{upload.progress}%</span>
            ) : null}
          </div>
          {upload.phase === 'uploading' ? (
            <progress
              aria-label={`Загрузка ${photo.fileName}`}
              className="mt-2 h-2 w-full accent-accent-600"
              max={100}
              value={upload.progress}
            />
          ) : null}
          {isActive ? (
            <button
              className="mt-2 min-h-11 text-sm font-semibold underline"
              type="button"
              onClick={() => onCancel(photo.id)}
            >
              Остановить
            </button>
          ) : null}
          {isRetryable ? (
            <button
              className="mt-2 min-h-11 text-sm font-semibold underline disabled:text-ink-300"
              disabled={!isOnline}
              type="button"
              onClick={() => onRetry(photo.id)}
            >
              Повторить загрузку
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
