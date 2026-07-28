import { HOME_DEMO_PHOTOS } from '@pages/Home/config'

export function HomeHeroBook() {
  return (
    <figure className="mx-auto w-full max-w-xl">
      <div className="relative rounded-[2.25rem] bg-cover-sand p-4 shadow-book sm:p-6">
        <div className="grid aspect-[1.45/1] grid-cols-2 overflow-hidden rounded-[1.5rem] bg-cover-linen shadow-surface">
          <div className="flex flex-col border-r border-ink-950/10 p-[9%]">
            <img
              alt={HOME_DEMO_PHOTOS.family.alt}
              className="h-[68%] w-full rounded-xl object-cover"
              decoding="async"
              fetchPriority="high"
              src={HOME_DEMO_PHOTOS.family.src}
            />
            <p className="mt-auto font-serif text-lg text-ink-700 sm:text-2xl">
              Наша история
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-[9%] sm:gap-3">
            <img
              alt={HOME_DEMO_PHOTOS.table.alt}
              className="h-full w-full rounded-lg object-cover"
              decoding="async"
              src={HOME_DEMO_PHOTOS.table.src}
            />
            <img
              alt={HOME_DEMO_PHOTOS.flowers.alt}
              className="h-full w-full rounded-lg object-cover"
              decoding="async"
              src={HOME_DEMO_PHOTOS.flowers.src}
            />
            <img
              alt={HOME_DEMO_PHOTOS.lake.alt}
              className="col-span-2 h-full w-full rounded-lg object-cover"
              decoding="async"
              src={HOME_DEMO_PHOTOS.lake.src}
            />
          </div>
        </div>

        <div className="absolute -right-3 -bottom-5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium shadow-surface sm:right-5">
          Макет можно изменить
        </div>
      </div>
      <figcaption className="mt-8 text-center text-xs tracking-[0.14em] text-ink-500 uppercase">
        Концептуальный разворот · демонстрационные изображения
      </figcaption>
    </figure>
  )
}
