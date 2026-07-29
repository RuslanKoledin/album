import { useId, useRef, useState, type DragEvent } from 'react'
import { FiImage, FiUploadCloud } from 'react-icons/fi'

import { LOCAL_PHOTO_ACCEPT } from '@photo-upload/model'

interface LocalPhotoPickerProps {
  readonly hasPhotos: boolean
  readonly disabled: boolean
  readonly onAddFiles: (files: readonly File[]) => void
}

export function LocalPhotoPicker({
  hasPhotos,
  disabled,
  onAddFiles,
}: LocalPhotoPickerProps) {
  const inputId = useId()
  const descriptionId = `${inputId}-description`
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const addFileList = (files: FileList | null) => {
    if (files) onAddFiles([...files])
  }
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    addFileList(event.dataTransfer.files)
  }

  return (
    <div
      className={`mt-6 rounded-3xl border border-dashed p-6 text-center transition-colors sm:p-8 ${
        isDragging
          ? 'border-accent-600 bg-accent-50'
          : 'border-control-border bg-paper-50'
      }`}
      onDragEnter={() => !disabled && setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        if (!disabled) handleDrop(event)
      }}
    >
      {hasPhotos ? (
        <FiImage
          aria-hidden="true"
          className="mx-auto text-3xl text-accent-600"
        />
      ) : (
        <FiUploadCloud
          aria-hidden="true"
          className="mx-auto text-3xl text-accent-600"
        />
      )}
      <p className="mt-3 font-semibold">
        {hasPhotos ? 'Добавить ещё фотографии' : 'Выберите фотографии'}
      </p>
      <p
        id={descriptionId}
        className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500"
      >
        JPEG, JPG или PNG, до 25 МБ каждый. Можно выбрать сразу несколько файлов
        или перетащить их сюда.
      </p>
      {!disabled ? (
        <button
          aria-describedby={descriptionId}
          className="mt-5 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface hover:bg-accent-700 focus:outline-2 focus:outline-offset-3 focus:outline-accent-600"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          Открыть галерею
        </button>
      ) : null}
      <input
        ref={inputRef}
        multiple
        accept={LOCAL_PHOTO_ACCEPT}
        aria-label="Выбрать фотографии для книги"
        aria-describedby={descriptionId}
        className="sr-only"
        disabled={disabled}
        id={inputId}
        name="localPhotos"
        type="file"
        onChange={(event) => {
          addFileList(event.currentTarget.files)
          event.currentTarget.value = ''
        }}
      />
    </div>
  )
}
