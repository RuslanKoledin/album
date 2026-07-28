import { FiCheckCircle } from 'react-icons/fi'

import type { ProductSpec } from '@core/book'

import { CREATE_PRESENTATION } from '@create-project/model'

import { CreateProductPreview } from './CreateProductPreview'

interface CreateProductStepProps {
  readonly productSpecs: readonly ProductSpec[]
  readonly selectedProductSpecId: string | null
  readonly onContinue: () => void
  readonly onSelect: (productSpecId: string) => void
}

export function CreateProductStep({
  productSpecs,
  selectedProductSpecId,
  onContinue,
  onSelect,
}: CreateProductStepProps) {
  return (
    <section aria-labelledby="create-product-title">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
        Шаг 1 из 4
      </p>
      <h1
        id="create-product-title"
        className="mt-3 font-serif text-4xl sm:text-5xl"
      >
        Проверьте формат
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-ink-700">
        Сейчас доступен один универсальный формат. Он уже выбран — проверьте
        параметры и переходите к необязательному описанию истории.
      </p>

      <fieldset className="mt-8 grid gap-4">
        <legend className="sr-only">Доступные продукты</legend>
        {productSpecs.map((productSpec) => {
          const isSelected = productSpec.id === selectedProductSpecId

          return (
            <label
              key={productSpec.id}
              className={`relative grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-4 rounded-3xl border p-5 transition-colors focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-accent-600 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 sm:p-6 ${
                isSelected
                  ? 'border-accent-600 bg-accent-50'
                  : 'border-border bg-surface hover:border-control-border'
              }`}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name="product"
                type="radio"
                value={productSpec.id}
                onChange={() => onSelect(productSpec.id)}
              />
              <CreateProductPreview />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-serif text-xl leading-tight sm:text-2xl">
                    {CREATE_PRESENTATION.productName}
                  </span>
                  {isSelected ? (
                    <FiCheckCircle
                      aria-label="Выбрано"
                      className="size-5 shrink-0 text-success"
                    />
                  ) : null}
                </span>
                <span className="mt-2 block text-sm leading-6 text-ink-700 sm:text-base sm:leading-7">
                  {CREATE_PRESENTATION.productDescription}
                </span>
                <span className="mt-3 block text-xs leading-5 font-medium text-ink-500 sm:mt-4 sm:text-sm">
                  {productSpec.coverSizeMm.width / 10} ×{' '}
                  {productSpec.coverSizeMm.height / 10} см · от{' '}
                  {productSpec.spreadCount.min} до {productSpec.spreadCount.max}{' '}
                  разворотов
                </span>
              </span>
            </label>
          )
        })}
      </fieldset>

      <button
        className="mt-8 min-h-12 w-full rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface hover:bg-accent-700 disabled:bg-ink-300 sm:w-auto"
        disabled={!selectedProductSpecId}
        type="button"
        onClick={onContinue}
      >
        Продолжить
      </button>
    </section>
  )
}
