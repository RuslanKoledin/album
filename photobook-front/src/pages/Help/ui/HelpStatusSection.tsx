import { HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi2'
import { Link } from 'react-router'

import {
  HELP_AVAILABLE_NOW,
  HELP_PENDING_CONFIRMATION,
} from '@pages/Help/config'

import { HelpStatusCard } from './HelpStatusCard'

export function HelpStatusSection() {
  return (
    <section className="page-container py-16 sm:py-20 lg:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent-600 uppercase">
          Статус сервиса
        </p>
        <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          Прототип уже можно проверить
        </h2>
        <p className="mt-5 text-lg leading-8 text-ink-700">
          Мы показываем только реализованный путь и не выдаём тестовые условия
          за предложение готового производства.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <HelpStatusCard
          icon={<HiOutlineCheckCircle aria-hidden="true" className="size-6" />}
          items={HELP_AVAILABLE_NOW}
          title="Доступно в прототипе"
        />
        <HelpStatusCard
          icon={<HiOutlineClock aria-hidden="true" className="size-6" />}
          items={HELP_PENDING_CONFIRMATION}
          title="Ждёт подтверждения"
        />
      </div>

      <Link
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface transition-colors hover:bg-accent-600"
        to="/create"
      >
        Перейти к конструктору
      </Link>
    </section>
  )
}
