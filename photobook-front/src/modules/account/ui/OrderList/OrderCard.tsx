import { Link } from 'react-router'

import {
  formatOrderNumber,
  getOrderProgressIndex,
  ORDER_PROGRESS_STEPS,
  type OrderDto,
} from '@modules/order'

interface OrderCardProps {
  readonly order: OrderDto
  readonly projectTitle: string | undefined
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-KG', {
    dateStyle: 'medium',
    timeZone: 'Asia/Bishkek',
  }).format(new Date(value))

export function OrderCard({ order, projectTitle }: OrderCardProps) {
  const status = ORDER_PROGRESS_STEPS[getOrderProgressIndex(order.status)]

  return (
    <article className="rounded-3xl border border-border bg-surface p-5 shadow-surface sm:p-6">
      <p className="text-xs font-semibold tracking-[0.14em] text-accent-600 uppercase">
        Тестовый заказ {formatOrderNumber(order.number)}
      </p>
      <h2 className="mt-3 font-serif text-2xl">
        {projectTitle ?? 'Фотокнига'}
      </h2>
      <p className="mt-2 text-sm font-semibold text-ink-700">
        {status?.label ?? 'Статус уточняется'}
      </p>
      <p className="mt-1 text-sm text-ink-500">
        Создан {formatDate(order.createdAt)} ·{' '}
        {order.delivery.method === 'pickup' ? 'Самовывоз' : 'Курьер'}
      </p>
      <Link
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ink-950 px-4 text-sm font-semibold text-surface"
        to={`/orders/${encodeURIComponent(order.id)}`}
      >
        Открыть заказ
      </Link>
    </article>
  )
}
