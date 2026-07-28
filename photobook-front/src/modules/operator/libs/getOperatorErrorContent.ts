import { getApiErrorCode } from '@shared/api'

interface OperatorErrorContent {
  readonly description: string
  readonly title: string
}

export function getOperatorErrorContent(error: unknown): OperatorErrorContent {
  const code = getApiErrorCode(error)
  if (code === 'AUTH_REQUIRED' || code === 'SESSION_EXPIRED') {
    return {
      title: 'Требуется вход',
      description: 'Войдите во внутренний аккаунт и снова откройте заказ.',
    }
  }
  if (code === 'ACCESS_DENIED') {
    return {
      title: 'Нет доступа',
      description: 'Этот экран доступен только сотруднику с ролью оператора.',
    }
  }
  if (code === 'RESOURCE_NOT_FOUND') {
    return {
      title: 'Заказ не найден',
      description: 'Проверьте внутреннюю ссылку или вернитесь к очереди.',
    }
  }

  return {
    title: 'Не удалось открыть заказ',
    description: 'Проверьте подключение и повторите попытку.',
  }
}
