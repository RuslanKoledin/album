import { Link } from 'react-router'

import {
  FORMAT_AVAILABLE_FEATURES,
  FORMAT_CANDIDATE_PRODUCTS,
  REFERENCE_FORMAT_FACTS,
} from '@pages/Books/config'

import { ReferenceBookPreview } from './ReferenceBookPreview'

export function ReferenceFormatSection() {
  return (
    <section className="border-y border-border bg-surface/55 py-16 sm:py-20">
      <div className="page-container grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <ReferenceBookPreview />

        <div>
          <p className="inline-flex rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">
            Закрытая beta
          </p>
          <h2 className="mt-5 font-serif text-4xl sm:text-5xl">
            Фотокнига в твёрдом переплёте
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-700">
            Это первый формат текущего пути. Его параметры позволяют проверить
            выбор шаблона, добавление фотографий и ручное редактирование до
            расширения каталога.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
            {REFERENCE_FORMAT_FACTS.map((fact) => (
              <div className="border-t border-ink-300 pt-3" key={fact.label}>
                <dt className="text-xs tracking-[0.1em] text-ink-500 uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-2 text-sm font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-3xl bg-paper-100 p-6">
            <h3 className="font-semibold">Что уже можно проверить</h3>
            <ul className="mt-4 grid gap-3 text-sm text-ink-700 sm:grid-cols-3">
              {FORMAT_AVAILABLE_FEATURES.map((feature) => (
                <li className="border-l border-accent-500 pl-3" key={feature}>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold">Следующие форматы-кандидаты</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {FORMAT_CANDIDATE_PRODUCTS.map((product) => (
                <article
                  className="rounded-2xl border border-border bg-surface p-4"
                  key={product.title}
                >
                  <p className="text-xs font-semibold tracking-[0.12em] text-accent-600 uppercase">
                    {product.status}
                  </p>
                  <h4 className="mt-2 font-semibold">{product.title}</h4>
                  <p className="text-ink-600 mt-2 text-sm leading-6">
                    {product.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <Link
            className="mt-8 inline-flex min-h-11 items-center rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface transition-colors hover:bg-accent-600"
            to="/create"
          >
            Открыть конструктор
          </Link>
        </div>
      </div>
    </section>
  )
}
