import { FiCheck, FiLayers } from 'react-icons/fi'

import type { TemplateSpec } from '@core/book'

import {
  CREATE_CATEGORY_OPTIONS,
  CREATE_PRESENTATION,
  SEEDED_PHOTO_PREVIEWS,
} from '@create-project/model'

interface CreateTemplateStepProps {
  readonly categoryTags: readonly string[]
  readonly selectedTemplateId: string | null
  readonly templates: readonly TemplateSpec[]
  readonly onBack: () => void
  readonly onContinue: () => void
  readonly onSelectTemplate: (templateId: string) => void
  readonly onToggleCategory: (categoryId: string) => void
}

export function CreateTemplateStep({
  categoryTags,
  selectedTemplateId,
  templates,
  onBack,
  onContinue,
  onSelectTemplate,
  onToggleCategory,
}: CreateTemplateStepProps) {
  return (
    <section aria-labelledby="create-template-title">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
        Шаг 2 из 4
      </p>
      <h1
        id="create-template-title"
        className="mt-3 font-serif text-4xl sm:text-5xl"
      >
        Добавьте контекст — по желанию
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-ink-700">
        Категории помогут найти проект позже, но не ограничат макеты и ручное
        редактирование. Этот шаг можно пропустить — базовый стиль уже выбран.
      </p>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold">
          Категории — необязательно
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CREATE_CATEGORY_OPTIONS.map((category) => {
            const isSelected = categoryTags.includes(category.id)

            return (
              <label
                key={category.id}
                className={`relative inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-accent-600 ${
                  isSelected
                    ? 'border-accent-600 bg-accent-50 text-accent-700'
                    : 'border-border bg-surface text-ink-700 hover:border-control-border'
                }`}
              >
                <input
                  checked={isSelected}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  name="category"
                  type="checkbox"
                  value={category.id}
                  onChange={() => onToggleCategory(category.id)}
                />
                <span className="grid size-4 shrink-0 place-items-center">
                  <FiCheck
                    aria-hidden="true"
                    className={isSelected ? 'opacity-100' : 'opacity-0'}
                  />
                </span>
                {category.label}
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="mt-9">
        <legend className="text-sm font-semibold">Основа макета</legend>
        <div className="mt-3 grid gap-4">
          {templates.map((template) => {
            const isSelected = selectedTemplateId === template.id

            return (
              <label
                key={template.id}
                className={`grid min-h-48 gap-5 rounded-3xl border p-5 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-accent-600 sm:grid-cols-[11rem_1fr] ${
                  isSelected
                    ? 'border-accent-600 bg-accent-50'
                    : 'border-border bg-surface hover:border-control-border'
                }`}
              >
                <input
                  checked={isSelected}
                  className="sr-only"
                  name="template"
                  type="radio"
                  onChange={() => onSelectTemplate(template.id)}
                />
                <span className="grid aspect-[4/3] grid-cols-2 gap-2 rounded-2xl bg-cover-sand p-3">
                  <img
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                    decoding="async"
                    loading="lazy"
                    src={SEEDED_PHOTO_PREVIEWS[0].src}
                  />
                  <span className="grid gap-2">
                    <img
                      alt=""
                      className="h-full w-full rounded-lg object-cover"
                      decoding="async"
                      loading="lazy"
                      src={SEEDED_PHOTO_PREVIEWS[1].src}
                    />
                    <img
                      alt=""
                      className="h-full w-full rounded-lg object-cover"
                      decoding="async"
                      loading="lazy"
                      src={SEEDED_PHOTO_PREVIEWS[2].src}
                    />
                  </span>
                </span>
                <span className="flex min-w-0 items-start gap-4">
                  <FiLayers
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-accent-700"
                  />
                  <span>
                    <span className="block font-serif text-2xl">
                      {CREATE_PRESENTATION.templateName}
                    </span>
                    <span className="mt-2 block leading-7 text-ink-700">
                      {CREATE_PRESENTATION.templateDescription}
                    </span>
                    <span className="mt-3 block text-sm font-medium text-ink-500">
                      Крупные фото · тёплая палитра · подписи по желанию
                    </span>
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
        <button
          className="min-h-12 rounded-full border border-control-border bg-surface px-6 text-sm font-semibold hover:bg-paper-100"
          type="button"
          onClick={onBack}
        >
          Назад
        </button>
        <button
          className="min-h-12 min-w-56 rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface hover:bg-accent-700 disabled:bg-ink-300"
          disabled={!selectedTemplateId}
          type="button"
          onClick={onContinue}
        >
          Продолжить к настройкам
        </button>
      </div>
    </section>
  )
}
