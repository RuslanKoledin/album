import {
  HOME_CATEGORY_EXAMPLES,
  HOME_CONSTRUCTOR_FEATURES,
} from '@pages/Home/config'

import { HomeLayoutPreview } from './HomeLayoutPreview'

export function HomeConstructorSection() {
  return (
    <section className="page-container grid items-center gap-12 py-18 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-18">
      <HomeLayoutPreview />

      <div>
        <p className="text-sm font-semibold tracking-[0.2em] text-accent-600 uppercase">
          Ограниченный конструктор
        </p>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl">
          Шаблон помогает начать. Решение остаётся за вами.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-8 text-ink-700">
          Сервис предлагает готовую структуру книги, но не запирает вас внутри
          неё. Любой предложенный макет можно продолжить редактировать вручную.
        </p>

        <ul className="mt-8 space-y-4">
          {HOME_CONSTRUCTOR_FEATURES.map((feature) => (
            <li className="flex gap-3 text-ink-700" key={feature}>
              <span
                aria-hidden="true"
                className="mt-2 size-2 shrink-0 rounded-full bg-accent-500"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-9 border-l-2 border-accent-500 pl-5">
          <p className="text-sm font-semibold">Категория описывает историю</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-700">
            {HOME_CATEGORY_EXAMPLES.join(', ')} — выбор сохраняет контекст
            проекта, но не меняет и не ограничивает доступные настройки.
          </p>
        </div>
      </div>
    </section>
  )
}
