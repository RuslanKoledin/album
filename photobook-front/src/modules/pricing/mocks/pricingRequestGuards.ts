import type { PriceQuoteRequestDto } from '@pricing/model'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasExactKeys = (value: UnknownRecord, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key))

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isOption = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['optionId', 'valueId']) &&
  isNonEmptyString(value.optionId) &&
  isNonEmptyString(value.valueId)

export const isPriceQuoteRequest = (
  value: unknown,
): value is PriceQuoteRequestDto =>
  isRecord(value) &&
  hasExactKeys(value, [
    'productId',
    'productSpecId',
    'catalogVersion',
    'spreadCount',
    'options',
    'quantity',
    'delivery',
  ]) &&
  isNonEmptyString(value.productId) &&
  isNonEmptyString(value.productSpecId) &&
  isNonEmptyString(value.catalogVersion) &&
  Number.isInteger(value.spreadCount) &&
  Number(value.spreadCount) > 0 &&
  Array.isArray(value.options) &&
  value.options.every(isOption) &&
  value.quantity === 1 &&
  isRecord(value.delivery) &&
  hasExactKeys(value.delivery, ['method', 'city']) &&
  ['pickup', 'courier'].includes(String(value.delivery.method)) &&
  value.delivery.city === 'Bishkek'
