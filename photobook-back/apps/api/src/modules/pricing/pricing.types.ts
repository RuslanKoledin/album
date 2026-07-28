export interface PriceQuoteRequest {
  readonly catalogVersion: string
  readonly delivery: {
    readonly city: 'Bishkek'
    readonly method: 'courier' | 'pickup'
  }
  readonly options: readonly {
    readonly optionId: string
    readonly valueId: string
  }[]
  readonly productId: string
  readonly productSpecId: string
  readonly quantity: 1
  readonly spreadCount: number
}
