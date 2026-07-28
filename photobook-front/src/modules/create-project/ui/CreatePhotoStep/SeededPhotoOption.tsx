import { FiCheck, FiImage } from 'react-icons/fi'

import { SEEDED_PHOTO_PREVIEWS } from '@create-project/model'

interface SeededPhotoOptionProps {
  readonly isSelected: boolean
  readonly onSelect: () => void
}

export function SeededPhotoOption({
  isSelected,
  onSelect,
}: SeededPhotoOptionProps) {
  return (
    <label
      className={`mt-6 block rounded-3xl border p-5 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-accent-600 ${isSelected ? 'border-accent-600 bg-accent-50' : 'border-border bg-surface hover:border-control-border'}`}
    >
      <input
        checked={isSelected}
        className="sr-only"
        name="photo-set"
        type="radio"
        onChange={onSelect}
      />
      <span className="flex items-start justify-between gap-4">
        <span>
          <span className="flex items-center gap-2 font-semibold">
            <FiImage aria-hidden="true" className="text-accent-600" />
            Проверить редактор на демо-наборе
          </span>
          <span className="mt-2 block text-sm leading-6 text-ink-500">
            Четыре демонстрационных снимка без отправки личных файлов.
          </span>
        </span>
        {isSelected ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-surface">
            <FiCheck aria-hidden="true" />
          </span>
        ) : null}
      </span>
      <span className="mt-4 grid grid-cols-4 gap-2">
        {SEEDED_PHOTO_PREVIEWS.map((photo) => (
          <img
            alt={photo.alt}
            className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
            decoding="async"
            key={photo.src}
            loading="lazy"
            src={photo.src}
          />
        ))}
      </span>
      <span className="mt-3 block text-xs leading-5 text-ink-500">
        Используйте этот вариант, если хотите сначала посмотреть конструктор.
      </span>
    </label>
  )
}
