import { Link } from 'react-router'
import { LuBookOpen, LuPackage, LuUserRound } from 'react-icons/lu'

import type { AccountTab } from '@account/model'

interface AccountTabsProps {
  readonly activeTab: AccountTab
  readonly orderCount: number
  readonly projectCount: number
}

const TABS = [
  { id: 'projects', label: 'Проекты', icon: LuBookOpen },
  { id: 'orders', label: 'Заказы', icon: LuPackage },
  { id: 'profile', label: 'Профиль', icon: LuUserRound },
] as const

export function AccountTabs({
  activeTab,
  orderCount,
  projectCount,
}: AccountTabsProps) {
  return (
    <nav
      aria-label="Разделы аккаунта"
      className="grid grid-cols-3 gap-1 sm:flex sm:gap-2 sm:overflow-x-auto"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const count = id === 'projects' ? projectCount : orderCount
        return (
          <Link
            key={id}
            aria-current={activeTab === id ? 'page' : undefined}
            className="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full border border-border bg-surface px-2 text-sm font-semibold aria-[current=page]:border-ink-950 aria-[current=page]:bg-ink-950 aria-[current=page]:text-surface sm:shrink-0 sm:gap-2 sm:px-4"
            to={`?tab=${id}`}
          >
            <Icon aria-hidden="true" size={17} />
            {label}
            {id !== 'profile' && (
              <span aria-label={`${count}`} className="opacity-65">
                {count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
