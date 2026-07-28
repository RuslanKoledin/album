import { Link } from 'react-router'

export function HelpHero() {
  return (
    <section className="page-container py-16 sm:py-20 lg:py-24">
      <p className="text-sm font-semibold tracking-[0.2em] text-accent-600 uppercase">
        Справочник beta-версии
      </p>
      <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.02] tracking-[-0.025em] sm:text-6xl">
        Начните книгу без догадок
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-700">
        Ниже — короткий путь от выбора основы до проверки макета и честные
        ограничения текущей версии. Оплата и запуск печати откроются после
        проверки производства.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface transition-colors hover:bg-accent-600"
          to="/create"
        >
          Создать книгу
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-control-border bg-surface px-6 text-sm font-semibold transition-colors hover:border-ink-950"
          to="/books"
        >
          Посмотреть формат
        </Link>
      </div>
    </section>
  )
}
