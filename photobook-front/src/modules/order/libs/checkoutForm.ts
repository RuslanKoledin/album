import { normalizeKyrgyzPhone } from '@modules/auth'

import type {
  CheckoutFormErrors,
  CheckoutFormState,
  CreateOrderRequestDto,
} from '@order/model'

export const getCheckoutFormErrors = (
  form: CheckoutFormState,
): CheckoutFormErrors => {
  const errors: CheckoutFormErrors = {}

  if (form.name.trim().length < 2) {
    errors.name = 'Укажите имя — минимум 2 символа.'
  }
  if (!normalizeKyrgyzPhone(form.phone)) {
    errors.phone = 'Введите номер Кыргызстана из 9 цифр после +996.'
  }
  if (form.deliveryMethod === 'courier' && form.address.trim().length < 5) {
    errors.address = 'Укажите адрес доставки в Бишкеке.'
  }

  return errors
}

export const createOrderRequest = (
  projectId: string,
  approvedRevisionId: string,
  priceQuoteId: string,
  form: CheckoutFormState,
): CreateOrderRequestDto | null => {
  const phone = normalizeKyrgyzPhone(form.phone)
  if (Object.keys(getCheckoutFormErrors(form)).length || !phone) return null

  return {
    projectId,
    approvedRevisionId,
    priceQuoteId,
    quantity: 1,
    contact: { name: form.name.trim(), phone },
    delivery:
      form.deliveryMethod === 'pickup'
        ? { method: 'pickup', city: 'Bishkek', address: null }
        : {
            method: 'courier',
            city: 'Bishkek',
            address: form.address.trim(),
          },
    customerComment: form.comment.trim() || null,
    approvedLayoutConfirmed: true,
    mockConditionsAcknowledged: true,
  }
}

export const formatOrderNumber = (value: string) => value.replace(/^MOCK-/, '№')
