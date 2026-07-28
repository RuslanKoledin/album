import { Link } from 'react-router'

import type { OrderDto } from '@modules/order'

import { AccountListState } from '@account-ui/AccountListState'

import { OrderCard } from './OrderCard'

interface OrderListProps {
  readonly isError: boolean
  readonly isLoading: boolean
  readonly orders: readonly OrderDto[]
  readonly projectTitles: ReadonlyMap<string, string>
  readonly retry: () => void
}

export function OrderList({
  isError,
  isLoading,
  orders,
  projectTitles,
  retry,
}: OrderListProps) {
  if (isLoading) {
    return (
      <AccountListState
        description="Получаем актуальные статусы заявок."
        title="Загружаем заказы…"
      />
    )
  }
  if (isError) {
    return (
      <AccountListState
        action={
          <button
            className="mt-6 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
            type="button"
            onClick={retry}
          >
            Повторить
          </button>
        }
        description="Проверьте подключение. Уже созданные заявки не изменились."
        title="Заказы пока недоступны"
      />
    )
  }
  if (orders.length === 0) {
    return (
      <AccountListState
        action={
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-full border border-control-border px-5 text-sm font-semibold hover:bg-paper-100"
            to="?tab=projects"
          >
            Открыть проекты
          </Link>
        }
        description="После утверждения макета и тестового оформления заявка появится здесь."
        title="Заказов пока нет"
      />
    )
  }

  return (
    <section aria-label="Заказы" className="grid gap-4 md:grid-cols-2">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          projectTitle={projectTitles.get(order.projectId)}
        />
      ))}
    </section>
  )
}
