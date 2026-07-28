import { Link, NavLink, Outlet } from 'react-router'
import { FiUser } from 'react-icons/fi'

import { MARKETING_NAVIGATION_ITEMS } from './config'

export function MarketingLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        className="sr-only rounded-full bg-ink-950 px-4 py-2 text-sm font-medium text-surface focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        href="#main-content"
      >
        Перейти к содержанию
      </a>

      <header className="border-b border-border bg-paper-50/85 backdrop-blur">
        <div className="page-container flex h-18 items-center justify-between gap-4 sm:gap-6">
          <Link
            className="inline-flex min-h-11 items-center font-serif text-xl tracking-tight"
            to="/"
          >
            Photobook
          </Link>

          <nav
            aria-label="Основная навигация"
            className="hidden items-center gap-3 text-sm text-ink-700 sm:flex"
          >
            {MARKETING_NAVIGATION_ITEMS.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 transition-colors hover:bg-paper-100 hover:text-ink-950 ${
                    isActive ? 'bg-paper-100 text-ink-950' : ''
                  }`
                }
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              aria-label="Мои проекты"
              className="inline-flex size-11 items-center justify-center rounded-full border border-control-border bg-surface text-ink-700 transition-colors hover:bg-paper-100 sm:hidden"
              to="/account"
            >
              <FiUser aria-hidden="true" size={18} />
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-full bg-ink-950 px-4 text-sm font-medium text-surface transition-colors hover:bg-accent-600 sm:px-5"
              to="/create"
            >
              Создать книгу
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="border-t border-border py-8 text-sm text-ink-500">
        <div className="page-container flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-lg text-ink-950">Photobook</p>
            <p className="mt-1">Онлайн-конструктор фотокниг для Бишкека.</p>
          </div>
          <nav
            aria-label="Навигация в подвале"
            className="flex flex-wrap gap-5"
          >
            {MARKETING_NAVIGATION_ITEMS.map((item) => (
              <Link
                className="min-h-11 content-center transition-colors hover:text-ink-950"
                key={item.to}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
