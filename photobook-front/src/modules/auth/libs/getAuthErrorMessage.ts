import { getApiErrorCode } from '@shared/api'

export const getAuthErrorMessage = (error: unknown): string => {
  switch (getApiErrorCode(error)) {
    case 'AUTH_CODE_INVALID':
      return 'Код не подошёл. Проверьте цифры и попробуйте ещё раз.'
    case 'AUTH_CODE_EXPIRED':
      return 'Срок действия кода закончился. Запросите новый код.'
    case 'RATE_LIMITED':
      return 'Слишком много попыток. Подождите немного и попробуйте снова.'
    case 'EXTERNAL_PROVIDER_UNAVAILABLE':
      return 'Сейчас не удалось отправить код. Номер сохранён — попробуйте ещё раз.'
    case 'VALIDATION_FAILED':
      return 'Проверьте введённые данные и попробуйте снова.'
    case 'CSRF_INVALID':
    case 'SESSION_EXPIRED':
    case 'AUTH_REQUIRED':
      return 'Сессия закончилась. Начните вход ещё раз.'
    default:
      return 'Не удалось выполнить вход. Проверьте подключение и попробуйте снова.'
  }
}
