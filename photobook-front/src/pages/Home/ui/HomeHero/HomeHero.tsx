import { Link } from 'react-router'

import { HomeHeroBook } from './HomeHeroBook'

export function HomeHero() {
  return (
    <section className="page-container grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-16">
      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-accent-600 uppercase">
          Онлайн-конструктор · Бишкек
        </p>
        <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
          Соберите историю, которую захочется листать
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-ink-700">
          Выберите готовую композицию, добавьте фотографии и настройте каждую
          страницу вручную. Без пустого холста и сотен лишних инструментов.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface transition-colors hover:bg-accent-600"
            to="/create"
          >
            Создать книгу
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-control-border bg-surface/55 px-6 text-sm font-semibold transition-colors hover:bg-surface"
            to="/books"
          >
            Посмотреть формат
          </Link>
        </div>

        <p className="mt-7 max-w-lg text-sm leading-6 text-ink-500">
          Открыта beta-версия конструктора: можно пройти путь от формата до
          заявки без оплаты. Реальные цены и сроки появятся после выбора
          печатного партнёра.
        </p>
      </div>

      <HomeHeroBook />
    </section>
  )
}
