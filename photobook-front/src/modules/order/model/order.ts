import type { CursorPageInfoDto } from '@shared/api'

export type DeliveryMethod = 'pickup' | 'courier'

export interface OrderContactDto {
  readonly name: string
  readonly phone: string
}

interface PickupDeliveryDto {
  readonly method: 'pickup'
  readonly city: 'Bishkek'
  readonly address: null
}

interface CourierDeliveryDto {
  readonly method: 'courier'
  readonly city: 'Bishkek'
  readonly address: string
}

export type OrderDeliveryDto = PickupDeliveryDto | CourierDeliveryDto

export type OrderStatus =
  | 'created'
  | 'awaiting_payment'
  | 'paid'
  | 'preflight_check'
  | 'in_production'
  | 'binding'
  | 'packaging'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'reprint_required'

export interface CreateOrderRequestDto {
  readonly projectId: string
  readonly approvedRevisionId: string
  readonly priceQuoteId: string
  readonly quantity: 1
  readonly contact: OrderContactDto
  readonly delivery: OrderDeliveryDto
  readonly customerComment: string | null
  readonly approvedLayoutConfirmed: true
  readonly mockConditionsAcknowledged: true
}

export interface OrderDto {
  readonly id: string
  readonly number: string
  readonly projectId: string
  readonly approvedRevisionId: string
  readonly priceQuoteId: string
  readonly status: OrderStatus
  readonly quantity: 1
  readonly contact: OrderContactDto
  readonly delivery: OrderDeliveryDto
  readonly customerComment: string | null
  readonly price: {
    readonly amountMinor: number
    readonly currency: 'KGS'
    readonly status: 'mock'
  }
  readonly createdAt: string
  readonly estimatedReadyAt: string | null
}

export interface OrderListResponseDto {
  readonly items: readonly OrderDto[]
  readonly pageInfo: CursorPageInfoDto
}

export interface CreateOrderArgs {
  readonly body: CreateOrderRequestDto
  readonly csrfToken: string
  readonly idempotencyKey: string
}
