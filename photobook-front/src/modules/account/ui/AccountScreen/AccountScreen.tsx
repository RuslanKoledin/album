import { Link } from 'react-router'

import { AccountSessionPanel } from '@modules/auth'

import { useAccountScreen } from '@account/hooks'

import { AuthenticatedAccount } from './AuthenticatedAccount'

export function AccountScreen() {
  const account = useAccountScreen()

  return (
    <main className="min-h-dvh bg-paper-50 py-8 sm:py-12">
      <div className="page-container">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            className="inline-flex min-h-11 items-center font-serif text-2xl"
            to="/"
          >
            Photobook
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-control-border bg-surface px-5 text-sm font-semibold hover:bg-paper-100"
            to="/create"
          >
            Создать книгу
          </Link>
        </header>
        <div className="mt-10 sm:mt-12">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
            Аккаунт
          </p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
            Личный кабинет
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-ink-700">
            Продолжайте макеты, проверяйте заявки и управляйте входом в аккаунт.
          </p>
        </div>
        <div className="mt-8">
          {account.session.data?.authenticated ? (
            <AuthenticatedAccount account={account} />
          ) : (
            <AccountSessionPanel />
          )}
        </div>
      </div>
    </main>
  )
}
