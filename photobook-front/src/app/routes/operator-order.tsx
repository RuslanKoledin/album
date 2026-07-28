import type { Route } from './+types/operator-order'

export { meta } from '@pages/OperatorOrder'
export { OperatorOrderPage as default } from '@pages/OperatorOrder'

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  return { orderId: params.orderId }
}
