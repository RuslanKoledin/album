import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from 'react'
import {
  FiAlertCircle,
  FiCheckCircle,
  FiFolder,
  FiImage,
  FiLoader,
  FiPlus,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi'

import {
  formatLocalPhotoSize,
  getLocalPhotoIssueMessage,
  getPhotoUploadStatusLabel,
} from '@photo-upload/libs'
import {
  LOCAL_PHOTO_ACCEPT,
  type LocalPhotoIssue,
  type LocalPhotoPreview,
  type PhotoUploadItem,
} from '@modules/photo-upload'

interface EditorPhotoUploadDialogProps {
  readonly error: string | null
  readonly isOpen: boolean
  readonly isUploading: boolean
  readonly issues: readonly LocalPhotoIssue[]
  readonly photos: readonly LocalPhotoPreview[]
  readonly uploadItems: readonly PhotoUploadItem[]
  readonly uploadReadyCount: number
  readonly onAddFiles: (files: readonly File[]) => void
  readonly onClear: () => void
  readonly onClose: () => void
  readonly onConfirm: () => void
  readonly onDismissIssues: () => void
  readonly onRemovePhoto: (id: string) => void
}

type DirectoryInputProps = InputHTMLAttributes<HTMLInputElement> & {
  readonly directory?: string
  readonly webkitdirectory?: string
}

const MIN_RECOMMENDED_PHOTOS = 20

const getUploadItem = (
  photo: LocalPhotoPreview,
  uploadItems: readonly PhotoUploadItem[],
) => uploadItems.find(({ localPhotoId }) => localPhotoId === photo.id)

const getUploadProgress = (
  photos: readonly LocalPhotoPreview[],
  uploadItems: readonly PhotoUploadItem[],
  uploadReadyCount: number,
) => {
  if (photos.length === 0) return 0
  if (uploadItems.length === 0) return Math.min(100, photos.length * 5)

  const totalProgress = photos.reduce((sum, photo) => {
    const item = getUploadItem(photo, uploadItems)
    return sum + (item?.phase === 'ready' ? 100 : (item?.progress ?? 0))
  }, 0)

  return Math.max(
    Math.round(totalProgress / photos.length),
    Math.round((uploadReadyCount / photos.length) * 100),
  )
}

export function EditorPhotoUploadDialog({
  error,
  isOpen,
  isUploading,
  issues,
  photos,
  uploadItems,
  uploadReadyCount,
  onAddFiles,
  onClear,
  onClose,
  onConfirm,
  onDismissIssues,
  onRemovePhoto,
}: EditorPhotoUploadDialogProps) {
  const pickerId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const hasPhotos = photos.length > 0
  const progress = getUploadProgress(photos, uploadItems, uploadReadyCount)
  const recommendationProgress = Math.min(
    100,
    Math.round((photos.length / MIN_RECOMMENDED_PHOTOS) * 100),
  )
  const fileInputProps = {
    accept: LOCAL_PHOTO_ACCEPT,
    multiple: true,
    type: 'file',
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget.files) onAddFiles([...event.currentTarget.files])
      event.currentTarget.value = ''
    },
  } satisfies InputHTMLAttributes<HTMLInputElement>
  const folderInputProps = {
    ...fileInputProps,
    directory: '',
    webkitdirectory: '',
  } satisfies DirectoryInputProps
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (!isUploading) onAddFiles([...event.dataTransfer.files])
  }

  if (!isOpen) return null

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/45 p-3 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-labelledby={`${pickerId}-title`}
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-surface shadow-floating sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7">
          <div className="min-w-0">
            <h2
              className="text-2xl font-semibold tracking-normal sm:text-4xl"
              id={`${pickerId}-title`}
            >
              {hasPhotos ? 'Проверьте выбранные фото' : 'Добавить фото'}
            </h2>
            <p className="text-ink-600 mt-2 max-w-3xl text-sm leading-6 sm:text-base">
              Чем больше фотографий вы добавите, тем проще собрать историю. Для
              автоматической раскладки лучше иметь минимум 20 снимков.
            </p>
          </div>
          <button
            aria-label="Закрыть добавление фото"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-2xl text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-950 disabled:opacity-45"
            disabled={isUploading}
            type="button"
            onClick={onClose}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          {!hasPhotos ? (
            <div
              className={`flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? 'border-accent-600 bg-accent-50'
                  : 'border-border bg-paper-50'
              }`}
              onDragEnter={() => !isUploading && setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <FiUploadCloud
                aria-hidden="true"
                className="text-5xl text-accent-600"
              />
              <p className="mt-5 text-lg font-semibold">
                Перетащите фотографии сюда
              </p>
              <p className="mt-2 text-sm text-ink-500">
                или выберите их вручную
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface transition-colors hover:bg-accent-700"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiImage aria-hidden="true" />
                  Выбрать фото
                </button>
                <button
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink-950 ring-1 ring-border transition-colors hover:bg-paper-100"
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                >
                  <FiFolder aria-hidden="true" />
                  Выбрать папку
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {photos.map((photo) => {
                  const upload = getUploadItem(photo, uploadItems)

                  return (
                    <figure
                      className="group relative overflow-hidden rounded-2xl bg-paper-100"
                      key={photo.id}
                    >
                      <img
                        alt=""
                        className="aspect-square w-full object-cover"
                        src={photo.previewUrl}
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-ink-950/72 p-2 text-[0.6875rem] leading-4 text-surface">
                        <span className="block truncate">{photo.fileName}</span>
                        <span className="block text-surface/70">
                          {upload
                            ? getPhotoUploadStatusLabel(upload)
                            : formatLocalPhotoSize(photo.sizeBytes)}
                        </span>
                      </figcaption>
                      {!isUploading ? (
                        <button
                          aria-label={`Убрать ${photo.fileName}`}
                          className="absolute top-2 right-2 inline-flex size-9 items-center justify-center rounded-full bg-surface/95 text-ink-700 opacity-100 shadow-surface transition-colors hover:bg-danger-soft hover:text-danger sm:opacity-0 sm:group-hover:opacity-100"
                          type="button"
                          onClick={() => onRemovePhoto(photo.id)}
                        >
                          <FiX aria-hidden="true" />
                        </button>
                      ) : null}
                    </figure>
                  )
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-paper-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {isUploading
                        ? `Загружено ${uploadReadyCount} из ${photos.length}`
                        : `Выбрано ${photos.length} фото`}
                    </p>
                    <p className="mt-1 text-sm text-ink-500">
                      {photos.length >= MIN_RECOMMENDED_PHOTOS
                        ? 'Достаточно для автоматической истории.'
                        : `Рекомендуем добавить ещё ${MIN_RECOMMENDED_PHOTOS - photos.length} для полной книги.`}
                    </p>
                  </div>
                  {!isUploading ? (
                    <button
                      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm font-semibold ring-1 ring-border transition-colors hover:bg-paper-100"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiPlus aria-hidden="true" />
                      Добавить ещё
                    </button>
                  ) : null}
                </div>
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-border"
                  role="progressbar"
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={
                    isUploading ? progress : recommendationProgress
                  }
                >
                  <span
                    className="block h-full rounded-full bg-accent-600 transition-all"
                    style={{
                      width: `${isUploading ? progress : recommendationProgress}%`,
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {issues.length > 0 && (
            <div
              className="mt-4 rounded-2xl bg-warning-soft p-4 text-sm leading-6 text-ink-700"
              role="alert"
            >
              <div className="flex items-start gap-2">
                <FiAlertCircle
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-warning"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Некоторые файлы не добавлены</p>
                  <ul className="mt-1 space-y-1">
                    {issues.slice(0, 4).map((issue) => (
                      <li
                        className="truncate"
                        key={`${issue.fileName}:${issue.code}`}
                      >
                        {issue.fileName} —{' '}
                        {getLocalPhotoIssueMessage(issue.code)}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="min-h-9 shrink-0 rounded-lg px-2 font-semibold underline"
                  type="button"
                  onClick={onDismissIssues}
                >
                  Скрыть
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              className="mt-4 flex gap-2 rounded-2xl bg-danger-soft p-4 text-sm leading-6 text-danger"
              role="alert"
            >
              <FiAlertCircle aria-hidden="true" className="mt-1 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2 text-sm text-ink-500">
            {uploadReadyCount === photos.length && photos.length > 0 ? (
              <FiCheckCircle aria-hidden="true" className="text-success" />
            ) : isUploading ? (
              <FiLoader aria-hidden="true" className="animate-spin" />
            ) : (
              <FiUploadCloud aria-hidden="true" />
            )}
            <span>
              {hasPhotos
                ? `${photos.length} выбрано, ${uploadReadyCount} загружено`
                : 'JPEG, JPG или PNG до 25 МБ'}
            </span>
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {hasPhotos && !isUploading ? (
              <button
                className="text-ink-600 min-h-12 rounded-full px-5 text-sm font-semibold transition-colors hover:bg-paper-100"
                type="button"
                onClick={onClear}
              >
                Очистить
              </button>
            ) : null}
            <button
              className="min-h-12 rounded-full bg-accent-600 px-6 text-sm font-semibold text-surface transition-colors hover:bg-accent-700 disabled:bg-ink-300"
              disabled={!hasPhotos || isUploading}
              type="button"
              onClick={onConfirm}
            >
              {isUploading ? 'Загружаем…' : 'Загрузить и добавить'}
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          aria-label="Выбрать фотографии"
          className="sr-only"
          {...fileInputProps}
        />
        <input
          ref={folderInputRef}
          aria-label="Выбрать папку с фотографиями"
          className="sr-only"
          {...folderInputProps}
        />
      </div>
    </div>
  )
}
