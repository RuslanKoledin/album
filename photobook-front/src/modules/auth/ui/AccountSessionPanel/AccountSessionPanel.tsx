import { Link, useLocation } from 'react-router'

import { useAccountSession } from '@auth/hooks'
import { formatKyrgyzPhone } from '@auth/libs'

export function AccountSessionPanel() {
  const account = useAccountSession()
  const location = useLocation()
  const returnTo = encodeURIComponent(`${location.pathname}${location.search}`)

  if (account.session.isLoading) {
    return (
      <section
        className="rounded-3xl border border-border bg-surface p-6"
        aria-busy="true"
      >
        <p className="text-sm text-ink-500">Проверяем аккаунт…</p>
      </section>
    )
  }

  if (account.session.isError) {
    return (
      <section className="rounded-3xl border border-warning bg-warning-soft p-6">
        <h2 className="font-semibold text-warning">
          Аккаунт пока не загрузился
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-700">
          Проверьте подключение. Проекты и фотографии не изменились.
        </p>
        <button
          className="mt-5 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
          type="button"
          onClick={() => void account.session.refetch()}
        >
          Повторить
        </button>
      </section>
    )
  }

  if (!account.session.data?.authenticated) {
    return (
      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-accent-600 uppercase">
          Гостевой режим
        </p>
        <h2 className="mt-3 font-serif text-3xl">
          Войдите, чтобы открыть проекты
        </h2>
        <p className="mt-3 max-w-xl leading-7 text-ink-700">
          Форматы и настройки книги доступны без входа. Аккаунт понадобится
          перед загрузкой оригиналов и сохранением проекта.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
          to={`/login?returnTo=${returnTo}`}
        >
          Войти по телефону
        </Link>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-success uppercase">
        Вы вошли
      </p>
      <h2 className="mt-3 font-serif text-3xl">
        {formatKyrgyzPhone(account.session.data.user.phone)}
      </h2>
      <p className="mt-3 text-sm leading-6 text-ink-700">
        Этот номер используется для доступа к проектам и заказам.
      </p>
      {account.logoutError && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {account.logoutError}
        </p>
      )}
      <button
        className="mt-6 min-h-11 rounded-full border border-control-border px-5 text-sm font-semibold hover:bg-paper-100 disabled:cursor-wait disabled:opacity-60"
        disabled={account.isSigningOut}
        type="button"
        onClick={() => void account.signOut()}
      >
        {account.isSigningOut ? 'Выходим…' : 'Выйти из аккаунта'}
      </button>
    </section>
  )
}
