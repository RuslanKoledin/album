import { Link } from 'react-router'

import { REFERENCE_PRODUCT_FEATURES } from '@pages/Home/config'

export function HomeReferenceProductSection() {
  return (
    <section className="bg-ink-950 py-18 text-surface sm:py-24">
      <div className="page-container grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-accent-100 uppercase">
            Beta-формат для проверки
          </p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
            Запускаем понятный формат и готовим расширение каталога
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-paper-200">
            Фотокнига в твёрдом переплёте — первый формат, на котором проверяем
            путь от шаблона до редактирования и заявки.
          </p>

          <ul className="mt-8 grid gap-3 text-sm text-paper-200 sm:grid-cols-3">
            {REFERENCE_PRODUCT_FEATURES.map((feature) => (
              <li className="border-l border-accent-500 pl-3" key={feature}>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] bg-surface p-7 text-ink-950 sm:p-9">
          <p className="inline-flex rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">
            Закрытая beta
          </p>
          <h3 className="mt-6 font-serif text-3xl">
            Сейчас проверяем производственный контур
          </h3>
          <p className="mt-4 leading-7 text-ink-700">
            Конструктор уже позволяет собрать макет и отправить beta-заявку.
            Материалы, цена и сроки будут зафиксированы после контрольной печати
            у выбранной типографии.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface transition-colors hover:bg-accent-600"
              to="/create"
            >
              Открыть конструктор
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-full border border-control-border px-5 text-sm font-semibold transition-colors hover:bg-paper-100"
              to="/books"
            >
              О формате
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
