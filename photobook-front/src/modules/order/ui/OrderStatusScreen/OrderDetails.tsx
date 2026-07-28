import { LuMapPin, LuPhone } from 'react-icons/lu'

import { formatKyrgyzPhone } from '@modules/auth'
import { formatKgsAmount } from '@modules/pricing'

import type { OrderDto } from '@order/model'

interface OrderDetailsProps {
  readonly order: OrderDto
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <section className="rounded-4xl border border-border bg-surface p-6 shadow-surface">
      <h2 className="font-serif text-3xl">Детали заявки</h2>
      <dl className="mt-6 divide-y divide-border text-sm">
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-ink-500">Beta-расчёт</dt>
          <dd className="font-semibold">
            {formatKgsAmount(order.price.amountMinor)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-ink-500">Получение</dt>
          <dd className="max-w-56 text-right font-semibold">
            {order.delivery.method === 'pickup'
              ? 'Самовывоз, адрес ещё не определён'
              : `Курьер: ${order.delivery.address}`}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-4">
          <dt className="text-ink-500">Готовность</dt>
          <dd className="max-w-56 text-right font-semibold">
            Уточнит менеджер перед печатью
          </dd>
        </div>
      </dl>
      <div className="mt-5 rounded-2xl bg-paper-100 p-4 text-sm leading-6">
        <p className="flex items-center gap-2 font-semibold">
          <LuPhone aria-hidden="true" size={18} />
          {order.contact.name} · {formatKyrgyzPhone(order.contact.phone)}
        </p>
        <p className="text-ink-600 mt-2 flex items-start gap-2">
          <LuMapPin aria-hidden="true" className="mt-1 shrink-0" size={18} />
          Бишкек. Контакт менеджера появится после запуска закрытой beta.
        </p>
      </div>
    </section>
  )
}
