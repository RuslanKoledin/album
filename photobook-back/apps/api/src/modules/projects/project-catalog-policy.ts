import { ApiError } from '@api/common/http/api-error.js'

import type {
  CreateProjectRequest,
  ResolvedProjectConfiguration,
} from './project.types.js'

interface ProductSpec {
  readonly allowedTemplateIds: readonly string[]
  readonly id: string
  readonly optionSpecs: readonly {
    readonly id: string
    readonly valueIds: readonly string[]
  }[]
  readonly productId: string
  readonly spreadCount: {
    readonly max: number
    readonly min: number
  }
}

interface TemplateSpec {
  readonly id: string
  readonly supportedProductSpecIds: readonly string[]
  readonly themeId: string
}

interface CatalogBundle {
  readonly productSpecs: readonly ProductSpec[]
  readonly templateSpecs: readonly TemplateSpec[]
}

function configurationError(field: string, message: string): never {
  throw new ApiError({
    code: 'VALIDATION_FAILED',
    fieldErrors: [{ field, message }],
    message: 'Выбранная конфигурация книги недоступна.',
    status: 422,
  })
}

export function resolveProjectConfiguration(
  catalog: unknown,
  request: CreateProjectRequest,
): ResolvedProjectConfiguration {
  const bundle = catalog as CatalogBundle
  const product = bundle.productSpecs.find(
    (item) => item.productId === request.productId,
  )
  if (!product) {
    configurationError('/productId', 'Выбранный продукт недоступен.')
  }
  if (
    request.spreadCount < product.spreadCount.min ||
    request.spreadCount > product.spreadCount.max
  ) {
    configurationError(
      '/spreadCount',
      'Количество разворотов недоступно для этого продукта.',
    )
  }
  if (!product.allowedTemplateIds.includes(request.templateId)) {
    configurationError('/templateId', 'Шаблон несовместим с продуктом.')
  }
  const template = bundle.templateSpecs.find(
    (item) => item.id === request.templateId,
  )
  if (!template || !template.supportedProductSpecIds.includes(product.id)) {
    configurationError('/templateId', 'Шаблон несовместим с продуктом.')
  }
  for (const option of request.optionSelections) {
    const spec = product.optionSpecs.find((item) => item.id === option.optionId)
    if (!spec?.valueIds.includes(option.valueId)) {
      configurationError(
        '/optionSelections',
        'Выбрана недоступная опция продукта.',
      )
    }
  }
  const selectedOptionIds = new Set(
    request.optionSelections.map((item) => item.optionId),
  )
  if (product.optionSpecs.some((item) => !selectedOptionIds.has(item.id))) {
    configurationError(
      '/optionSelections',
      'Выберите значение для каждой обязательной опции.',
    )
  }

  return { productSpecId: product.id, themeId: template.themeId }
}
