import { getApiErrorCode } from '@shared/api'

export interface CreateProjectFailure {
  readonly message: string
  readonly requiresSignIn: boolean
}

export const getCreateProjectFailure = (
  error: unknown,
): CreateProjectFailure => {
  switch (getApiErrorCode(error)) {
    case 'AUTH_REQUIRED':
    case 'SESSION_EXPIRED':
      return {
        message:
          'Сессия закончилась. Войдите снова — настройки книги сохранятся.',
        requiresSignIn: true,
      }
    case 'CSRF_INVALID':
      return {
        message:
          'Защитная сессия изменилась. Обновите вход и повторите создание.',
        requiresSignIn: true,
      }
    case 'VALIDATION_FAILED':
      return {
        message:
          'Настройки книги изменились. Вернитесь назад и проверьте выбор.',
        requiresSignIn: false,
      }
    case 'IDEMPOTENCY_KEY_REUSED':
      return {
        message: 'Не удалось безопасно повторить создание. Попробуйте ещё раз.',
        requiresSignIn: false,
      }
    default:
      return {
        message:
          'Не удалось создать проект. Ваш выбор сохранён — попробуйте ещё раз.',
        requiresSignIn: false,
      }
  }
}
