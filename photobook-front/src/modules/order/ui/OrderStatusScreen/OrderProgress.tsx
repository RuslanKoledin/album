import { LuCheck } from 'react-icons/lu'

import { getOrderProgressIndex, ORDER_PROGRESS_STEPS } from '@order/model'
import type { OrderStatus } from '@order/model'

interface OrderProgressProps {
  readonly status: OrderStatus
}

export function OrderProgress({ status }: OrderProgressProps) {
  const currentIndex = getOrderProgressIndex(status)

  return (
    <ol className="mt-7 space-y-1" aria-label="Этапы заказа">
      {ORDER_PROGRESS_STEPS.map((step, index) => {
        const completed = index <= currentIndex

        return (
          <li
            className="grid grid-cols-[2.75rem_minmax(0,1fr)]"
            key={step.status}
          >
            <div className="flex flex-col items-center">
              <span
                className={`inline-flex size-8 items-center justify-center rounded-full border ${completed ? 'border-ink-950 bg-ink-950 text-surface' : 'text-ink-400 border-border bg-surface'}`}
              >
                {completed ? (
                  <LuCheck aria-hidden="true" size={16} />
                ) : (
                  index + 1
                )}
              </span>
              {index < ORDER_PROGRESS_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`min-h-10 w-px flex-1 ${index < currentIndex ? 'bg-ink-950' : 'bg-border'}`}
                />
              )}
            </div>
            <div className="pt-1 pb-6">
              <p className="text-sm font-semibold">{step.label}</p>
              <p className="mt-1 text-sm leading-6 text-ink-500">
                {step.description}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
