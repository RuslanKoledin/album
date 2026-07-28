import { FiInfo } from 'react-icons/fi'
import { LOCAL_PHOTO_SET_ID } from '@modules/photo-upload'
import { formatKgsAmount } from '@modules/pricing'

import {
  COVER_VALUE_LABELS,
  CREATE_CATEGORY_OPTIONS,
  CREATE_PRESENTATION,
  SEEDED_PHOTO_SET,
  type CreatePriceEstimate,
  type CreateProjectSelection,
} from '@create-project/model'
import { formatSpreadCount } from '@create-project/libs'

interface CreateProjectSummaryProps {
  readonly localPhotoCount: number
  readonly isPriceError: boolean
  readonly isPriceLoading: boolean
  readonly priceEstimate: CreatePriceEstimate | null
  readonly selection: CreateProjectSelection
}

export function CreateProjectSummary({
  localPhotoCount,
  isPriceError,
  isPriceLoading,
  priceEstimate,
  selection,
}: CreateProjectSummaryProps) {
  const categoryLabels = CREATE_CATEGORY_OPTIONS.filter(({ id }) =>
    selection.categoryTags.includes(id),
  ).map(({ label }) => label)

  return (
    <aside className="rounded-3xl border border-border bg-surface p-6 lg:sticky lg:top-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-accent-600 uppercase">
        Ваш выбор
      </p>
      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="text-ink-500">Продукт</dt>
          <dd className="mt-1 font-semibold">
            {selection.productSpec
              ? CREATE_PRESENTATION.productName
              : 'Не выбран'}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Шаблон</dt>
          <dd className="mt-1 font-semibold">
            {selection.template
              ? CREATE_PRESENTATION.templateName
              : 'Не выбран'}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">История</dt>
          <dd className="mt-1 font-semibold">
            {categoryLabels.length > 0
              ? categoryLabels.join(', ')
              : 'Без категории'}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Комплектация</dt>
          <dd className="mt-1 font-semibold">
            {selection.spreadCount !== null
              ? `${formatSpreadCount(selection.spreadCount)}, ${COVER_VALUE_LABELS[selection.coverValueId ?? ''] ?? 'обложка по умолчанию'}`
              : 'После выбора продукта'}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Фотографии</dt>
          <dd className="mt-1 font-semibold">
            {selection.photoSetId === LOCAL_PHOTO_SET_ID
              ? `${localPhotoCount} с устройства`
              : selection.photoSetId === SEEDED_PHOTO_SET.id
                ? 'Демонстрационный набор'
                : 'Не выбраны'}
          </dd>
        </div>
      </dl>

      {selection.step !== 'details' ? (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm text-ink-500">Ориентировочная цена</p>
          <p className="mt-1 font-serif text-3xl">
            {isPriceLoading
              ? 'Считаем…'
              : priceEstimate
                ? formatKgsAmount(priceEstimate.amountMinor)
                : isPriceError
                  ? 'Недоступен'
                  : 'После настройки'}
          </p>
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-ink-500">
            <FiInfo aria-hidden="true" className="mt-0.5 shrink-0" />
            Beta-расчёт помогает проверить оформление заявки. Публичная цена
            появится после контрольной печати.
          </p>
        </div>
      ) : null}
    </aside>
  )
}
