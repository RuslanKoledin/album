import { describe, expect, it } from 'vitest'

import { EMPTY_CHECKOUT_FORM } from '@order/model'

import { createOrderRequest, getCheckoutFormErrors } from './checkoutForm'

const completeForm = {
  ...EMPTY_CHECKOUT_FORM,
  name: 'Руслан',
  phone: '+996 555 123 456',
  approvedLayoutConfirmed: true,
  mockConditionsAcknowledged: true,
}

describe('checkout form', () => {
  it('requires a courier address before creating an order request', () => {
    const form = {
      ...completeForm,
      deliveryMethod: 'courier' as const,
      address: '',
    }

    expect(getCheckoutFormErrors(form)).toEqual({
      address: 'Укажите адрес доставки в Бишкеке.',
    })
    expect(
      createOrderRequest('mock-project', 'mock-revision', 'mock-price', form),
    ).toBeNull()
  })

  it('creates a normalized courier delivery request when required fields pass', () => {
    const form = {
      ...completeForm,
      deliveryMethod: 'courier' as const,
      address: 'Бишкек, ул. Тестовая 1',
      comment: 'Позвонить заранее',
    }

    expect(
      createOrderRequest('mock-project', 'mock-revision', 'mock-price', form),
    ).toMatchObject({
      contact: { name: 'Руслан', phone: '+996555123456' },
      customerComment: 'Позвонить заранее',
      delivery: {
        method: 'courier',
        city: 'Bishkek',
        address: 'Бишкек, ул. Тестовая 1',
      },
    })
  })
})
