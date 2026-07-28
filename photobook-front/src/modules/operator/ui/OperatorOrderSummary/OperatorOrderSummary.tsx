import type { OrderDto } from '@modules/order'
import { formatKyrgyzPhone } from '@modules/auth'

import { formatOperatorDate } from '@operator/libs'

interface OperatorOrderSummaryProps {
  readonly order: OrderDto
}

export function OperatorOrderSummary({ order }: OperatorOrderSummaryProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <p className="text-xs font-semibold tracking-[0.15em] text-accent-600 uppercase">
        Клиент и получение
      </p>
      <h2 className="mt-3 font-serif text-3xl">{order.contact.name}</h2>
      <dl className="mt-5 grid gap-4 text-sm">
        <div>
          <dt className="text-ink-500">Телефон</dt>
          <dd className="mt-1 font-semibold">
            {formatKyrgyzPhone(order.contact.phone)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Получение</dt>
          <dd className="mt-1 font-semibold">
            {order.delivery.method === 'pickup'
              ? 'Самовывоз, Бишкек'
              : `Курьер, ${order.delivery.address}`}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Создан</dt>
          <dd className="mt-1 font-semibold">
            {formatOperatorDate(order.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Комментарий</dt>
          <dd className="mt-1 leading-6">
            {order.customerComment ?? 'Нет комментария'}
          </dd>
        </div>
      </dl>
    </section>
  )
}
