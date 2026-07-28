import { Link } from 'react-router'
import { LuArrowLeft } from 'react-icons/lu'

import { CenteredMessagePage } from '@shared/ui'

import { useCheckoutForm } from '@order/hooks'
import { CheckoutForm } from '@order-ui/CheckoutForm'

import { OrderSummary } from './OrderSummary'

interface CheckoutScreenProps {
  readonly projectId: string
}

export function CheckoutScreen({ projectId }: CheckoutScreenProps) {
  const checkout = useCheckoutForm(projectId)
  const { priceQuoteQuery, projectQuery, sessionQuery } = checkout

  if (projectQuery.isLoading || sessionQuery.isLoading) {
    return (
      <CenteredMessagePage
        description="Загружаем утверждённую версию и контактные данные."
        eyebrow="Заказ"
        title="Готовим оформление"
      />
    )
  }

  if (sessionQuery.data && !sessionQuery.data.authenticated) {
    return (
      <CenteredMessagePage
        description="Войдите, чтобы заказ был связан с вашим проектом."
        eyebrow="Заказ"
        title="Нужна авторизация"
      >
        <Link
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface"
          to={`/login?returnTo=${encodeURIComponent(`/checkout/${projectId}`)}`}
        >
          Войти
        </Link>
      </CenteredMessagePage>
    )
  }

  if (
    projectQuery.isError ||
    sessionQuery.isError ||
    !checkout.project ||
    !checkout.revision
  ) {
    return (
      <CenteredMessagePage
        description="Не удалось загрузить проект. Проверьте интернет и попробуйте снова."
        eyebrow="Заказ"
        title="Оформление пока не открылось"
      >
        <button
          className="mt-8 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
          type="button"
          onClick={() => void projectQuery.refetch()}
        >
          Повторить
        </button>
      </CenteredMessagePage>
    )
  }

  if (!checkout.isApproved) {
    return (
      <CenteredMessagePage
        description="Заказать можно только последнюю сохранённую и утверждённую версию."
        eyebrow="Заказ"
        title="Сначала проверьте макет"
      >
        <Link
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface"
          to={`/projects/${encodeURIComponent(projectId)}/preview`}
        >
          Открыть проверку
        </Link>
      </CenteredMessagePage>
    )
  }

  if (priceQuoteQuery.isLoading) {
    return (
      <CenteredMessagePage
        description="Считаем выбранную комплектацию и способ получения."
        eyebrow="Заказ"
        title="Готовим тестовый расчёт"
      />
    )
  }

  if (priceQuoteQuery.isError || !checkout.priceQuote) {
    return (
      <CenteredMessagePage
        description="Проект и утверждённый макет сохранены. Повторите только расчёт стоимости."
        eyebrow="Заказ"
        title="Расчёт пока недоступен"
      >
        <button
          className="mt-8 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
          type="button"
          onClick={() => void priceQuoteQuery.refetch()}
        >
          Повторить расчёт
        </button>
      </CenteredMessagePage>
    )
  }

  const spreadCount = checkout.revision.document.spreads.length

  return (
    <main className="min-h-dvh bg-paper-100 pb-16">
      <header className="border-b border-border bg-surface/90">
        <div className="page-container flex min-h-16 items-center gap-3">
          <Link
            aria-label="Вернуться к предпросмотру"
            className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-surface hover:bg-paper-100"
            to={`/projects/${encodeURIComponent(projectId)}/preview`}
          >
            <LuArrowLeft aria-hidden="true" size={20} />
          </Link>
          <div>
            <p className="text-xs text-ink-500">Тестовая заявка</p>
            <h1 className="text-sm font-semibold sm:text-base">
              Оформление книги
            </h1>
          </div>
        </div>
      </header>

      <div className="page-container pt-8 sm:pt-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
            Без оплаты
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            Контакты и способ получения
          </h2>
          <p className="text-ink-600 mt-4 leading-7">
            Создадим тестовую заявку без оплаты. Имя, телефон и выбранный способ
            получения сохранятся в её деталях.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <CheckoutForm
            canSubmit={checkout.canSubmit}
            errorMessage={checkout.errorMessage}
            errors={checkout.errors}
            form={checkout.form}
            isOnline={checkout.isOnline}
            isSubmitting={checkout.isSubmitting}
            onChange={checkout.changeForm}
            onSubmit={() => void checkout.submit()}
          />
          <OrderSummary
            deliveryAddress={checkout.form.address}
            deliveryMethod={checkout.form.deliveryMethod}
            priceMinor={checkout.priceQuote.total.amountMinor}
            projectTitle={checkout.project.title}
            revisionNumber={checkout.revision.revisionNumber}
            spreadCount={spreadCount}
          />
        </div>
      </div>
    </main>
  )
}
