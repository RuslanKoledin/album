import type { ProductSpec, TemplateSpec } from '@core/book'

export const CREATE_PROJECT_STEPS = [
  'product',
  'template',
  'details',
  'photos',
] as const

export type CreateProjectStep = (typeof CREATE_PROJECT_STEPS)[number]

export interface CreateProjectSelection {
  readonly categoryTags: readonly string[]
  readonly coverValueId: string | null
  readonly photoSetId: string | null
  readonly productSpec: ProductSpec | null
  readonly spreadCount: number | null
  readonly step: CreateProjectStep
  readonly template: TemplateSpec | null
}

export interface CreateCategoryOption {
  readonly id: string
  readonly label: string
}

export interface CreatePresentation {
  readonly productDescription: string
  readonly productName: string
  readonly templateDescription: string
  readonly templateName: string
}

export interface CreatePriceEstimate {
  readonly amountMinor: number
  readonly currency: 'KGS'
  readonly status: 'provisional'
}

export interface CreatePhotoSet {
  readonly assetIds: readonly string[]
  readonly description: string
  readonly id: string
  readonly name: string
}
