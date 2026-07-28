import { useParams } from 'react-router'

import { OperatorOrderScreen } from '@modules/operator'
import { CenteredMessagePage } from '@shared/ui'

export function OperatorOrderPage() {
  const { orderId } = useParams()
  if (!orderId) {
    return (
      <CenteredMessagePage
        description="Во внутренней ссылке отсутствует номер заказа."
        eyebrow="Внутренний экран"
        title="Заказ не указан"
      />
    )
  }

  return <OperatorOrderScreen orderId={orderId} />
}
