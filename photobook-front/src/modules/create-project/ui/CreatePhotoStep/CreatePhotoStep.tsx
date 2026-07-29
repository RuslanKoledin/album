import { FiLoader, FiWifiOff } from 'react-icons/fi'

import {
  LOCAL_PHOTO_SET_ID,
  type LocalPhotoIssue,
  type LocalPhotoPreview,
  type PhotoUploadItem,
} from '@modules/photo-upload'

import type { CreateProjectFailure } from '@create-project/libs'
import { SEEDED_PHOTO_SET } from '@create-project/model'

import { LocalPhotoSelectionPanel } from './LocalPhotoSelectionPanel'
import { SeededPhotoOption } from './SeededPhotoOption'

interface CreatePhotoStepProps {
  readonly failure: CreateProjectFailure | null
  readonly isCreating: boolean
  readonly isOnline: boolean
  readonly isReady: boolean
  readonly isSubmitting: boolean
  readonly localIssues: readonly LocalPhotoIssue[]
  readonly localPhotos: readonly LocalPhotoPreview[]
  readonly uploadAllReady: boolean
  readonly uploadBatchFailed: boolean
  readonly uploadHasStarted: boolean
  readonly uploadItems: readonly PhotoUploadItem[]
  readonly uploadReadyCount: number
  readonly selectedPhotoSetId: string | null
  readonly onAddLocalFiles: (files: readonly File[]) => void
  readonly onBack: () => void
  readonly onCancelUpload: (id: string) => void
  readonly onClearLocalPhotos: () => void
  readonly onCreate: () => void
  readonly onDismissLocalIssues: () => void
  readonly onRemoveLocalPhoto: (id: string) => void
  readonly onRetryUpload: (id: string) => void
  readonly onSelectPhotoSet: (photoSetId: string) => void
  readonly onSignIn: () => void
}

export function CreatePhotoStep({
  failure,
  isCreating,
  isOnline,
  isReady,
  isSubmitting,
  localIssues,
  localPhotos,
  uploadAllReady,
  uploadBatchFailed,
  uploadHasStarted,
  uploadItems,
  uploadReadyCount,
  selectedPhotoSetId,
  onAddLocalFiles,
  onBack,
  onCancelUpload,
  onClearLocalPhotos,
  onCreate,
  onDismissLocalIssues,
  onRemoveLocalPhoto,
  onRetryUpload,
  onSelectPhotoSet,
  onSignIn,
}: CreatePhotoStepProps) {
  const isLocalSelected = selectedPhotoSetId === LOCAL_PHOTO_SET_ID
  const isSeededSelected = selectedPhotoSetId === SEEDED_PHOTO_SET.id
  const canSubmitLocal =
    isLocalSelected &&
    localPhotos.length > 0 &&
    (!uploadHasStarted || uploadAllReady || uploadBatchFailed)
  const submitLabel = isLocalSelected
    ? isCreating
      ? 'Создаём проект…'
      : uploadAllReady
        ? 'Сохранить фото и открыть редактор'
        : uploadBatchFailed
          ? 'Повторить подготовку загрузки'
          : isSubmitting
            ? `Загружено ${uploadReadyCount} из ${localPhotos.length}`
            : uploadHasStarted
              ? 'Повторите файлы с ошибкой'
              : `Загрузить ${localPhotos.length} фото и открыть редактор`
    : isCreating
      ? 'Создаём проект…'
      : 'Создать и открыть редактор'

  return (
    <section aria-busy={isSubmitting} aria-labelledby="create-photos-title">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
        Шаг 4 из 4
      </p>
      <h1
        id="create-photos-title"
        className="mt-3 font-serif text-4xl sm:text-5xl"
      >
        Выберите фотографии для книги
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-ink-700">
        Загрузите JPEG или PNG с устройства. После загрузки первые фотографии
        сразу попадут на обложку и развороты, а остальные останутся в библиотеке
        редактора.
      </p>

      <LocalPhotoSelectionPanel
        isSelected={isLocalSelected}
        isLocked={uploadHasStarted}
        isOnline={isOnline}
        issues={localIssues}
        photos={localPhotos}
        uploadItems={uploadItems}
        uploadReadyCount={uploadReadyCount}
        onAddFiles={onAddLocalFiles}
        onCancelUpload={onCancelUpload}
        onClear={onClearLocalPhotos}
        onDismissIssues={onDismissLocalIssues}
        onRemove={onRemoveLocalPhoto}
        onRetryUpload={onRetryUpload}
        onSelect={() => onSelectPhotoSet(LOCAL_PHOTO_SET_ID)}
      />

      {!uploadHasStarted ? (
        <SeededPhotoOption
          isSelected={isSeededSelected}
          onSelect={() => onSelectPhotoSet(SEEDED_PHOTO_SET.id)}
        />
      ) : null}

      {!isOnline ? (
        <div
          className="mt-5 flex gap-3 rounded-2xl bg-warning-soft p-4 text-sm leading-6"
          role="status"
        >
          <FiWifiOff aria-hidden="true" className="mt-1 shrink-0" />
          Нет подключения. Фотографии можно продолжать выбирать; их отправка
          станет доступна после восстановления сети.
        </div>
      ) : null}

      {failure ? (
        <div
          className="mt-5 rounded-2xl border border-danger bg-danger-soft p-4 text-sm leading-6"
          role="alert"
        >
          <p>{failure.message}</p>
          {failure.requiresSignIn ? (
            <button
              className="mt-3 font-semibold underline"
              type="button"
              onClick={onSignIn}
            >
              Войти снова
            </button>
          ) : null}
        </div>
      ) : null}

      {!selectedPhotoSetId ? (
        <p
          className="mt-5 rounded-2xl bg-paper-100 p-4 text-sm leading-6 text-ink-700"
          role="status"
        >
          Чтобы продолжить, добавьте свои фотографии или выберите демо-набор.
        </p>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
        <button
          className="min-h-12 rounded-full border border-control-border bg-surface px-6 text-sm font-semibold hover:bg-paper-100 disabled:text-ink-300"
          disabled={uploadHasStarted}
          type="button"
          onClick={onBack}
        >
          Назад к настройкам
        </button>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface hover:bg-accent-700 disabled:bg-ink-300"
          disabled={
            (!isSeededSelected && !canSubmitLocal) ||
            !isReady ||
            !isOnline ||
            isSubmitting
          }
          type="button"
          onClick={onCreate}
        >
          {isSubmitting ? (
            <FiLoader aria-hidden="true" className="animate-spin" />
          ) : null}
          {submitLabel}
        </button>
      </div>
    </section>
  )
}
