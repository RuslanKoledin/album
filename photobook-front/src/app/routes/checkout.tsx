export { meta } from '@pages/Checkout'
import { CheckoutPage } from '@pages/Checkout'

import type { Route } from './+types/checkout'

export default function CheckoutRoute({ params }: Route.ComponentProps) {
  return <CheckoutPage projectId={params.projectId} />
}
