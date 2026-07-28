import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { FiArrowLeft, FiLock } from 'react-icons/fi'

interface AuthPageLayoutProps {
  readonly children: ReactNode
  readonly description: string
  readonly title: string
}

export function AuthPageLayout({
  children,
  description,
  title,
}: AuthPageLayoutProps) {
  return (
    <main className="min-h-dvh bg-paper-50 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[minmax(20rem,0.8fr)_minmax(30rem,1.2fr)] lg:gap-8 lg:p-8">
      <aside className="hidden rounded-4xl bg-cover-sand p-10 lg:flex lg:flex-col lg:justify-between">
        <Link className="font-serif text-2xl" to="/">
          Photobook
        </Link>
        <div className="max-w-md">
          <p className="text-xs font-semibold tracking-[0.18em] text-ink-500 uppercase">
            Личный семейный архив
          </p>
          <h2 className="mt-4 font-serif text-5xl leading-[1.02]">
            Один номер для ваших книг и заявок
          </h2>
          <p className="mt-5 leading-7 text-ink-700">
            После входа вы сможете возвращаться к сохранённым проектам и
            тестовым заявкам с одного аккаунта.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-surface/55 p-4 text-sm leading-6 text-ink-700">
          <FiLock aria-hidden="true" className="mt-1 shrink-0" />
          Код действует недолго. Мы не просим пароль и не показываем, есть ли у
          номера аккаунт.
        </div>
      </aside>

      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-xl flex-col justify-center">
        <Link
          className="mb-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-2 text-sm font-medium text-ink-700 hover:text-ink-950 lg:mb-10"
          to="/"
        >
          <FiArrowLeft aria-hidden="true" />
          На главную
        </Link>
        <div className="rounded-4xl border border-border bg-surface p-6 shadow-surface sm:p-9">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
            Вход без пароля
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-lg leading-7 text-ink-700">{description}</p>
          {children}
        </div>
      </section>
    </main>
  )
}
