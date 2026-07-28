import { Link } from 'react-router'

import { CenteredMessagePage } from '@shared/ui'
import { useGetProjectQuery } from '@modules/project'

import { useGetOrderQuery } from '@order/api'
import { formatOrderNumber } from '@order/libs'
import { getOrderProgressIndex, ORDER_PROGRESS_STEPS } from '@order/model'

import { OrderDetails } from './OrderDetails'
import { OrderProgress } from './OrderProgress'

interface OrderStatusScreenProps {
  readonly orderId: string
}

const formatCreatedAt = (value: string) =>
  new Intl.DateTimeFormat('ru-KG', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Bishkek',
  }).format(new Date(value))

export function OrderStatusScreen({ orderId }: OrderStatusScreenProps) {
  const orderQuery = useGetOrderQuery(orderId)
  const projectId = orderQuery.data?.projectId ?? ''
  const projectQuery = useGetProjectQuery(projectId, { skip: !projectId })

  if (orderQuery.isLoading) {
    return (
      <CenteredMessagePage
        description="Загружаем текущий статус заявки."
        eyebrow="Заказ"
        title="Проверяем состояние"
      />
    )
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <CenteredMessagePage
        description="Заказ не найден или статус временно недоступен."
        eyebrow="Заказ"
        title="Не удалось открыть заявку"
      >
        <button
          className="mt-8 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
          type="button"
          onClick={() => void orderQuery.refetch()}
        >
          Повторить
        </button>
      </CenteredMessagePage>
    )
  }

  const order = orderQuery.data
  const currentStep = ORDER_PROGRESS_STEPS[getOrderProgressIndex(order.status)]

  return (
    <main className="min-h-dvh bg-paper-100 pb-16">
      <header className="border-b border-border bg-surface/90">
        <div className="page-container flex min-h-16 items-center justify-between gap-4">
          <Link
            className="inline-flex min-h-11 items-center font-serif text-2xl"
            to="/"
          >
            Photobook
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold hover:bg-paper-100"
            to="/account?tab=orders"
          >
            Мои заказы
          </Link>
        </div>
      </header>

      <div className="page-container pt-8 sm:pt-12">
        <div className="max-w-3xl">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
              Тестовая заявка {formatOrderNumber(order.number)}
            </p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
              {currentStep?.label ?? 'Статус заявки'}
            </h1>
            <p className="mt-3 font-semibold text-ink-700">
              {projectQuery.data?.project.title ?? 'Фотокнига'}
            </p>
            <p className="mt-2 text-sm text-ink-500">
              {formatCreatedAt(order.createdAt)} · Бишкек
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-warning-soft p-4 text-sm leading-6 text-ink-700">
          Это демонстрационная заявка. Её статус не изменится, менеджер не
          свяжется, оплата и производство не запускаются.
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <section className="rounded-4xl border border-border bg-surface p-6 shadow-surface sm:p-8">
            <h2 className="font-serif text-3xl">
              Как будет проходить реальный заказ
            </h2>
            <OrderProgress status={order.status} />
          </section>
          <OrderDetails order={order} />
        </div>
      </div>
    </main>
  )
}
