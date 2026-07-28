import type {
  BookConfigurationBundle,
  ProductSpec,
  TemplateSpec,
} from '@core/book'
import { LOCAL_PHOTO_SET_ID } from '@modules/photo-upload'

import {
  CREATE_CATEGORY_OPTIONS,
  CREATE_PROJECT_STEPS,
  SEEDED_PHOTO_SET,
  type CreateProjectSelection,
  type CreateProjectStep,
} from '@create-project/model'

const CATEGORY_IDS = new Set(CREATE_CATEGORY_OPTIONS.map(({ id }) => id))

const isCreateProjectStep = (
  value: string | null,
): value is CreateProjectStep =>
  CREATE_PROJECT_STEPS.some((step) => step === value)

const findProductSpec = (
  catalog: BookConfigurationBundle,
  productSpecId: string | null,
) => {
  if (productSpecId) {
    return catalog.productSpecs.find(({ id }) => id === productSpecId) ?? null
  }

  return catalog.productSpecs.length === 1
    ? (catalog.productSpecs[0] ?? null)
    : null
}

export const getCompatibleTemplates = (
  catalog: BookConfigurationBundle,
  productSpec: ProductSpec | null,
): readonly TemplateSpec[] => {
  if (!productSpec) return []

  return catalog.templateSpecs.filter(
    ({ id, supportedProductSpecIds }) =>
      productSpec.allowedTemplateIds.includes(id) &&
      supportedProductSpecIds.includes(productSpec.id),
  )
}

const getSpreadCount = (
  value: string | null,
  productSpec: ProductSpec | null,
) => {
  if (!productSpec) return null

  const spreadCount = Number(value)
  return Number.isInteger(spreadCount) &&
    spreadCount >= productSpec.spreadCount.min &&
    spreadCount <= productSpec.spreadCount.max
    ? spreadCount
    : productSpec.spreadCount.default
}

const getCoverValueId = (
  value: string | null,
  productSpec: ProductSpec | null,
) => {
  const coverOption = productSpec?.optionSpecs[0]
  if (!coverOption) return null

  return value && coverOption.valueIds.includes(value)
    ? value
    : (coverOption.valueIds[0] ?? null)
}

export const getCreateProjectSelection = (
  searchParams: URLSearchParams,
  catalog: BookConfigurationBundle,
): CreateProjectSelection => {
  const productSpec = findProductSpec(catalog, searchParams.get('product'))
  const compatibleTemplates = getCompatibleTemplates(catalog, productSpec)
  const templateId = searchParams.get('template')
  const template = templateId
    ? (compatibleTemplates.find(({ id }) => id === templateId) ?? null)
    : compatibleTemplates.length === 1
      ? (compatibleTemplates[0] ?? null)
      : null
  const requestedStep = searchParams.get('step')
  let step: CreateProjectStep = isCreateProjectStep(requestedStep)
    ? requestedStep
    : 'product'

  if (!productSpec) step = 'product'
  else if ((step === 'details' || step === 'photos') && !template)
    step = 'template'

  return {
    categoryTags: [
      ...new Set(
        searchParams.getAll('category').filter((id) => CATEGORY_IDS.has(id)),
      ),
    ],
    coverValueId: getCoverValueId(searchParams.get('cover'), productSpec),
    photoSetId: [SEEDED_PHOTO_SET.id, LOCAL_PHOTO_SET_ID].includes(
      searchParams.get('photos') ?? '',
    )
      ? searchParams.get('photos')
      : null,
    productSpec,
    spreadCount: getSpreadCount(searchParams.get('spreads'), productSpec),
    step,
    template,
  }
}
