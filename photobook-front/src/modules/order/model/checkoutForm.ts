import type { DeliveryMethod } from './order'

export interface CheckoutFormState {
  readonly name: string
  readonly phone: string
  readonly deliveryMethod: DeliveryMethod
  readonly address: string
  readonly comment: string
  readonly approvedLayoutConfirmed: boolean
  readonly mockConditionsAcknowledged: boolean
}

export interface CheckoutFormErrors {
  name?: string
  phone?: string
  address?: string
}

export const EMPTY_CHECKOUT_FORM: CheckoutFormState = {
  name: '',
  phone: '',
  deliveryMethod: 'pickup',
  address: '',
  comment: '',
  approvedLayoutConfirmed: false,
  mockConditionsAcknowledged: false,
}
