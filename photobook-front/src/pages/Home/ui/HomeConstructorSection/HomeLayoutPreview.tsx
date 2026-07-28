import { HOME_DEMO_PHOTOS } from '@pages/Home/config'

export function HomeLayoutPreview() {
  return (
    <div
      aria-label="Пример выбора макета страницы"
      className="rounded-[2rem] border border-border bg-paper-100 p-5 shadow-surface sm:p-7"
      role="img"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-xs tracking-[0.14em] text-ink-500 uppercase">
            Разворот 2
          </p>
          <p className="mt-1 text-sm font-semibold">Фото и подпись</p>
        </div>
        <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success">
          Выбран
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-accent-500 bg-surface p-3">
          <div className="grid aspect-[2/1] grid-cols-[1.35fr_0.65fr] gap-2">
            <img
              alt=""
              className="h-full w-full rounded-lg object-cover"
              decoding="async"
              loading="lazy"
              src={HOME_DEMO_PHOTOS.family.src}
            />
            <div className="space-y-2 py-2">
              <div className="h-2 rounded-full bg-ink-300" />
              <div className="h-2 w-3/4 rounded-full bg-ink-300" />
            </div>
          </div>
          <p className="mt-3 text-xs font-medium">1 фото + подпись</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/70 p-3">
          <img
            alt=""
            className="aspect-[2/1] w-full rounded-lg object-cover"
            decoding="async"
            loading="lazy"
            src={HOME_DEMO_PHOTOS.lake.src}
          />
          <p className="mt-3 text-xs font-medium text-ink-700">
            Фото на разворот
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-surface/75 p-4 text-sm leading-6 text-ink-700">
        В редакторе видны выбранная раскладка, количество фотографий, текст и
        применённая тема.
      </div>
    </div>
  )
}
