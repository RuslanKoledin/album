import type { OrderStatus } from './order'

export const ORDER_PROGRESS_STEPS: ReadonlyArray<{
  readonly status: OrderStatus
  readonly label: string
  readonly description: string
}> = [
  {
    status: 'created',
    label: 'Beta-заявка создана',
    description: 'Данные сохранены для проверки сценария оформления.',
  },
  {
    status: 'awaiting_payment',
    label: 'Согласование и оплата',
    description:
      'В реальном заказе менеджер подтвердит цену и безопасный способ оплаты.',
  },
  {
    status: 'in_production',
    label: 'Изготовление',
    description: 'Производство начнётся только после оплаты и проверки макета.',
  },
  {
    status: 'ready_for_pickup',
    label: 'Готово к получению',
    description: 'В реальном заказе сообщим после проверки готовой книги.',
  },
]

const ORDER_PROGRESS_INDEX: Partial<Record<OrderStatus, number>> = {
  created: 0,
  awaiting_payment: 1,
  paid: 1,
  preflight_check: 1,
  in_production: 2,
  binding: 2,
  packaging: 2,
  ready_for_pickup: 3,
  out_for_delivery: 3,
  completed: 3,
}

export const getOrderProgressIndex = (status: OrderStatus) =>
  ORDER_PROGRESS_INDEX[status] ?? 0
