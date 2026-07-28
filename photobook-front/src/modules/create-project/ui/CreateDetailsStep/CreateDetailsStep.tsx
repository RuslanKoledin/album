import { FiCheckCircle, FiMinus, FiPlus } from 'react-icons/fi'

import type { ProductSpec } from '@core/book'
import { formatKgsAmount } from '@modules/pricing'

import { formatSpreadCount } from '@create-project/libs'
import {
  COVER_VALUE_LABELS,
  type CreatePriceEstimate,
} from '@create-project/model'

interface CreateDetailsStepProps {
  readonly coverValueId: string | null
  readonly priceEstimate: CreatePriceEstimate | null
  readonly isPriceError: boolean
  readonly isPriceLoading: boolean
  readonly productSpec: ProductSpec
  readonly spreadCount: number
  readonly continueLabel: string
  readonly onBack: () => void
  readonly onContinue: () => void
  readonly onSelectCover: (coverValueId: string) => void
  readonly onSelectSpreadCount: (spreadCount: number) => void
  readonly onRetryPrice: () => void
}

export function CreateDetailsStep({
  coverValueId,
  priceEstimate,
  isPriceError,
  isPriceLoading,
  productSpec,
  spreadCount,
  continueLabel,
  onBack,
  onContinue,
  onSelectCover,
  onSelectSpreadCount,
  onRetryPrice,
}: CreateDetailsStepProps) {
  const coverValueIds = productSpec.optionSpecs[0]?.valueIds ?? []
  const isMinimum = spreadCount <= productSpec.spreadCount.min
  const isMaximum = spreadCount >= productSpec.spreadCount.max

  return (
    <section aria-labelledby="create-details-title">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
        Шаг 3 из 4
      </p>
      <h1
        id="create-details-title"
        className="mt-3 font-serif text-4xl sm:text-5xl"
      >
        Настройте комплектацию
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-ink-700">
        Оставляем только решения, которые действительно влияют на книгу: обложку
        и начальное количество разворотов.
      </p>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">Цвет обложки</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {coverValueIds.map((valueId) => {
            const isSelected = coverValueId === valueId
            const isSand = valueId.includes('sand')

            return (
              <label
                key={valueId}
                className={`flex min-h-20 items-center gap-4 rounded-2xl border p-4 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-accent-600 ${
                  isSelected
                    ? 'border-accent-600 bg-accent-50'
                    : 'border-border bg-surface hover:border-control-border'
                }`}
              >
                <input
                  checked={isSelected}
                  className="sr-only"
                  name="cover"
                  type="radio"
                  onChange={() => onSelectCover(valueId)}
                />
                <span
                  aria-hidden="true"
                  className={`size-11 rounded-xl border border-border ${
                    isSand ? 'bg-cover-sand' : 'bg-cover-linen'
                  }`}
                />
                <span className="font-semibold">
                  {COVER_VALUE_LABELS[valueId] ?? 'Вариант обложки'}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-8 rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-sm font-semibold">Количество разворотов</p>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Сейчас доступен beta-диапазон. Точные параметры подтвердим перед
          запуском печати.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <button
            aria-label="Уменьшить количество разворотов"
            className="flex size-11 items-center justify-center rounded-full border border-control-border bg-surface disabled:border-border disabled:text-ink-300"
            disabled={isMinimum}
            type="button"
            onClick={() => onSelectSpreadCount(spreadCount - 1)}
          >
            <FiMinus aria-hidden="true" />
          </button>
          <output className="min-w-32 text-center font-serif text-2xl">
            {formatSpreadCount(spreadCount)}
          </output>
          <button
            aria-label="Увеличить количество разворотов"
            className="flex size-11 items-center justify-center rounded-full border border-control-border bg-surface disabled:border-border disabled:text-ink-300"
            disabled={isMaximum}
            type="button"
            onClick={() => onSelectSpreadCount(spreadCount + 1)}
          >
            <FiPlus aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-ink-950 p-6 text-surface">
        <p className="text-sm text-paper-200">Beta-расчёт стоимости</p>
        <p className="mt-2 font-serif text-4xl">
          {isPriceLoading
            ? 'Считаем…'
            : priceEstimate
              ? formatKgsAmount(priceEstimate.amountMinor)
              : 'Расчёт недоступен'}
        </p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-paper-200">
          Это предварительный расчёт, не оферта. Итоговую стоимость подтвердим
          после выбора печатного партнёра.
        </p>
        {isPriceError && (
          <button
            className="mt-4 min-h-11 rounded-full border border-paper-200 px-5 text-sm font-semibold hover:bg-surface/10"
            type="button"
            onClick={onRetryPrice}
          >
            Повторить расчёт
          </button>
        )}
      </div>

      <div
        className="mt-6 flex items-start gap-3 rounded-2xl bg-success-soft p-4 text-sm leading-6 text-ink-700"
        role="status"
      >
        <FiCheckCircle
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-success"
        />
        <span>
          Настройки готовы и сохраняются в адресе страницы. Перед сохранением
          проекта при необходимости попросим войти; фотографии до вашего
          подтверждения никуда не загружаются.
        </span>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
        <button
          className="min-h-12 rounded-full border border-control-border bg-surface px-6 text-sm font-semibold hover:bg-paper-100"
          type="button"
          onClick={onBack}
        >
          Назад к истории
        </button>
        <button
          className="min-h-12 rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface hover:bg-accent-700 disabled:bg-ink-300"
          disabled={!coverValueId}
          type="button"
          onClick={onContinue}
        >
          {continueLabel}
        </button>
      </div>
    </section>
  )
}
