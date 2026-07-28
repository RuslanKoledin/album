import { OrderStatusScreen } from '@modules/order'

interface OrderPageProps {
  readonly orderId: string
}

export function OrderPage({ orderId }: OrderPageProps) {
  return <OrderStatusScreen orderId={orderId} />
}
