import { Link } from 'react-router'

import { CenteredMessagePage } from '@shared/ui'

import { useGetOperatorOrderQuery } from '@operator/api'
import { getOperatorErrorContent } from '@operator/libs'
import { OperatorOrderSummary } from '@operator-ui/OperatorOrderSummary'
import { OperatorPreflightIssues } from '@operator-ui/OperatorPreflightIssues'
import { OperatorProjectReview } from '@operator-ui/OperatorProjectReview'

interface OperatorOrderScreenProps {
  readonly orderId: string
}

export function OperatorOrderScreen({ orderId }: OperatorOrderScreenProps) {
  const query = useGetOperatorOrderQuery(orderId)

  if (query.isLoading) {
    return (
      <CenteredMessagePage
        description="Сверяем заказ и утверждённую версию макета."
        eyebrow="Внутренний экран"
        title="Загружаем заказ…"
      />
    )
  }
  if (query.isError || !query.data) {
    const content = getOperatorErrorContent(query.error)
    return (
      <CenteredMessagePage
        description={content.description}
        eyebrow="Внутренний экран"
        title={content.title}
      >
        <button
          className="mt-7 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
          type="button"
          onClick={() => void query.refetch()}
        >
          Повторить
        </button>
      </CenteredMessagePage>
    )
  }

  const detail = query.data
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
          <span className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
            Только чтение
          </span>
        </div>
      </header>
      <div className="page-container pt-8 sm:pt-12">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
          Оператор · {detail.order.number}
        </p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
          Проверка заказа
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-ink-700">
          Внутренний mock-просмотр связывает заявку с утверждённой revision.
          Оплата, печатный PDF и производство здесь ещё не подключены.
        </p>
        <div className="mt-6 rounded-2xl bg-warning-soft p-4 text-sm leading-6 text-ink-700">
          Демонстрационные данные не являются производственным заданием.
        </div>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <div className="grid gap-6">
            <OperatorProjectReview detail={detail} />
            <OperatorPreflightIssues run={detail.preflightRun} />
          </div>
          <OperatorOrderSummary order={detail.order} />
        </div>
      </div>
    </main>
  )
}
