export { meta } from '@pages/Order'
import { OrderPage } from '@pages/Order'

import type { Route } from './+types/order'

export default function OrderRoute({ params }: Route.ComponentProps) {
  return <OrderPage orderId={params.orderId} />
}
