import { SEEDED_PHOTO_PREVIEWS } from '@create-project/model'

export function CreateProductPreview() {
  return (
    <span
      aria-hidden="true"
      className="relative block aspect-square w-20 shrink-0 rounded-2xl bg-cover-sand p-2 shadow-surface sm:w-32 sm:rounded-3xl sm:p-3"
    >
      <span className="flex h-full flex-col overflow-hidden rounded-xl border border-surface/70 bg-cover-linen p-1.5 sm:rounded-2xl sm:p-2">
        <img
          alt=""
          className="min-h-0 flex-1 rounded-lg object-cover"
          decoding="async"
          loading="lazy"
          src={SEEDED_PHOTO_PREVIEWS[0].src}
        />
        <span className="mt-1 block truncate text-center font-serif text-[8px] text-ink-700 sm:mt-2 sm:text-xs">
          Наша история
        </span>
      </span>
      <span className="text-ink-600 absolute -right-1 -bottom-1 rounded-full bg-surface px-2 py-1 text-[8px] font-semibold shadow-surface sm:text-[10px]">
        Макет
      </span>
    </span>
  )
}
