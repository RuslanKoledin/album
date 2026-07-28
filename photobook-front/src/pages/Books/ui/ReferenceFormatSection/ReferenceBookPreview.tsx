import { REFERENCE_BOOK_PHOTO } from '@pages/Books/config'

export function ReferenceBookPreview() {
  return (
    <figure>
      <div className="relative mx-auto aspect-square w-full max-w-md rounded-[2.5rem] bg-cover-sand p-[7%] shadow-book">
        <div className="flex h-full flex-col justify-between rounded-[1.7rem] border border-surface/60 bg-cover-linen p-[10%]">
          <img
            alt={REFERENCE_BOOK_PHOTO.alt}
            className="aspect-[4/3] w-full rounded-2xl object-cover"
            decoding="async"
            loading="lazy"
            src={REFERENCE_BOOK_PHOTO.src}
          />
          <div>
            <p className="font-serif text-2xl text-ink-700">Тёплая история</p>
            <p className="mt-2 text-xs tracking-[0.16em] text-ink-500 uppercase">
              Концептуальная обложка
            </p>
          </div>
        </div>
        <div className="absolute -right-3 -bottom-4 -z-10 aspect-square w-5/6 rotate-6 rounded-[2.3rem] bg-cover-leather" />
      </div>
      <figcaption className="mt-8 text-center text-sm leading-6 text-ink-500">
        Концептуальная обложка с демонстрационным изображением, а не фотография
        готового изделия.
      </figcaption>
    </figure>
  )
}
