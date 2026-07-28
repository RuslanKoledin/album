import { Link } from 'react-router'

import {
  FORMAT_AVAILABLE_FEATURES,
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
            Тестовая конфигурация
          </p>
          <h2 className="mt-5 font-serif text-4xl sm:text-5xl">
            Фотокнига в твёрдом переплёте
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-700">
            Это единственный формат текущего тестового пути. Его параметры
            позволяют проверить выбор шаблона, добавление фотографий и ручное
            редактирование без лишнего каталога.
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
