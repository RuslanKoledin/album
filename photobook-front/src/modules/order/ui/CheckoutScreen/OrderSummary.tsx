import { LuBookOpenCheck, LuMapPin } from 'react-icons/lu'
import { formatKgsAmount } from '@modules/pricing'

import type { DeliveryMethod } from '@order/model'

interface OrderSummaryProps {
  readonly deliveryAddress: string
  readonly deliveryMethod: DeliveryMethod
  readonly priceMinor: number
  readonly projectTitle: string
  readonly revisionNumber: number
  readonly spreadCount: number
}

export function OrderSummary({
  deliveryAddress,
  deliveryMethod,
  priceMinor,
  projectTitle,
  revisionNumber,
  spreadCount,
}: OrderSummaryProps) {
  const deliveryLabel =
    deliveryMethod === 'pickup'
      ? 'Самовывоз · точка ещё не определена'
      : deliveryAddress.trim()
        ? `Курьер · ${deliveryAddress.trim()}`
        : 'Курьер по Бишкеку · укажите адрес'

  return (
    <aside className="rounded-4xl border border-border bg-surface p-6 shadow-surface lg:sticky lg:top-6">
      <p className="text-xs font-semibold tracking-[0.16em] text-accent-600 uppercase">
        Тестовая заявка
      </p>
      <p className="mt-3 text-sm text-ink-500">Проект</p>
      <h2 className="mt-1 font-serif text-3xl">{projectTitle}</h2>
      <div className="mt-6 space-y-4 border-y border-border py-5 text-sm">
        <div className="flex gap-3">
          <LuBookOpenCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-accent-600"
            size={20}
          />
          <p>
            Утверждённая версия №{revisionNumber}
            <span className="mt-1 block text-ink-500">
              {spreadCount} {spreadCount === 1 ? 'разворот' : 'разворота'}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <LuMapPin
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-accent-600"
            size={20}
          />
          <p>
            Бишкек
            <span className="mt-1 block text-ink-500">{deliveryLabel}</span>
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <span className="text-ink-600 text-sm">Тестовый расчёт</span>
        <strong className="text-xl">{formatKgsAmount(priceMinor)}</strong>
      </div>
      <p className="mt-3 text-xs leading-5 text-warning">
        Не оферта. Финальная цена и срок появятся только после производственного
        подтверждения.
      </p>
    </aside>
  )
}
