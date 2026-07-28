import { CheckoutScreen } from '@modules/order'

interface CheckoutPageProps {
  readonly projectId: string
}

export function CheckoutPage({ projectId }: CheckoutPageProps) {
  return <CheckoutScreen projectId={projectId} />
}
