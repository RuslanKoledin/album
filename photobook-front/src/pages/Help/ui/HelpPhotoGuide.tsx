import { HiOutlinePhoto } from 'react-icons/hi2'

import { HELP_PHOTO_TIPS } from '@pages/Help/config'

export function HelpPhotoGuide() {
  return (
    <section className="page-container py-16 sm:py-20 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div>
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-accent-50 text-accent-700">
            <HiOutlinePhoto aria-hidden="true" className="size-6" />
          </span>
          <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
            Подготовьте фотографии
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink-700">
            Поддерживаются JPEG, JPG и PNG. HEIC пока не принимается: сначала
            нужно проверить преобразование и восстановление загрузки на реальных
            устройствах.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {HELP_PHOTO_TIPS.map((tip) => (
            <li
              className="rounded-3xl border border-border bg-surface/65 p-6 leading-7 text-ink-700"
              key={tip}
            >
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
