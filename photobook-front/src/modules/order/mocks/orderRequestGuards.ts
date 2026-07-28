import type { CreateOrderRequestDto } from '@order/model'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const hasExactKeys = (value: UnknownRecord, keys: readonly string[]) =>
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key))

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isContact = (value: unknown) =>
  isRecord(value) &&
  hasExactKeys(value, ['name', 'phone']) &&
  isNonEmptyString(value.name) &&
  /^\+[1-9][0-9]{7,14}$/.test(String(value.phone))

const isDelivery = (value: unknown) => {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ['method', 'city', 'address']) ||
    value.city !== 'Bishkek'
  ) {
    return false
  }

  return value.method === 'pickup'
    ? value.address === null
    : value.method === 'courier' && isNonEmptyString(value.address)
}

export const isCreateOrderRequest = (
  value: unknown,
): value is CreateOrderRequestDto =>
  isRecord(value) &&
  hasExactKeys(value, [
    'projectId',
    'approvedRevisionId',
    'priceQuoteId',
    'quantity',
    'contact',
    'delivery',
    'customerComment',
    'approvedLayoutConfirmed',
    'mockConditionsAcknowledged',
  ]) &&
  isNonEmptyString(value.projectId) &&
  isNonEmptyString(value.approvedRevisionId) &&
  isNonEmptyString(value.priceQuoteId) &&
  value.quantity === 1 &&
  isContact(value.contact) &&
  isDelivery(value.delivery) &&
  (value.customerComment === null || isNonEmptyString(value.customerComment)) &&
  value.approvedLayoutConfirmed === true &&
  value.mockConditionsAcknowledged === true
