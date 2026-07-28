import { getApiErrorCode } from '@shared/api'

export const getOrderErrorMessage = (error: unknown) => {
  const code = getApiErrorCode(error)

  if (code === 'APPROVAL_REQUIRED' || code === 'PROJECT_REVISION_CONFLICT') {
    return 'Актуальная версия макета не утверждена. Вернитесь к проверке книги.'
  }
  if (code === 'CSRF_INVALID' || code === 'SESSION_EXPIRED') {
    return 'Сессия закончилась. Войдите снова и повторите заказ.'
  }
  if (code === 'PRICE_QUOTE_INVALID') {
    return 'Beta-расчёт изменился или устарел. Обновите его и повторите заказ.'
  }
  if (code === 'VALIDATION_FAILED') {
    return 'Проверьте контактные данные и способ получения.'
  }

  return 'Не удалось создать заказ. Данные сохранены на экране — попробуйте ещё раз.'
}
