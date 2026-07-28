import { isBookDocumentV1 } from '@core/book'

import type {
  CreateProjectRequestDto,
  SaveProjectDocumentRequestDto,
} from '@project/model'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasExactKeys = (value: UnknownRecord, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key))

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

const isProductOptionSelection = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['optionId', 'valueId']) &&
  isNonEmptyString(value.optionId) &&
  isNonEmptyString(value.valueId)

export const isCreateProjectRequest = (
  value: unknown,
): value is CreateProjectRequestDto =>
  isRecord(value) &&
  hasExactKeys(value, [
    'productId',
    'templateId',
    'catalogVersion',
    'categoryTags',
    'spreadCount',
    'optionSelections',
  ]) &&
  isNonEmptyString(value.productId) &&
  isNonEmptyString(value.templateId) &&
  isNonEmptyString(value.catalogVersion) &&
  Array.isArray(value.categoryTags) &&
  value.categoryTags.every(isNonEmptyString) &&
  Number.isInteger(value.spreadCount) &&
  Array.isArray(value.optionSelections) &&
  value.optionSelections.every(isProductOptionSelection)

export const isSaveProjectDocumentRequest = (
  value: unknown,
): value is SaveProjectDocumentRequestDto =>
  isRecord(value) &&
  hasExactKeys(value, ['baseRevisionId', 'clientMutationId', 'document']) &&
  isNonEmptyString(value.baseRevisionId) &&
  isNonEmptyString(value.clientMutationId) &&
  isBookDocumentV1(value.document)
