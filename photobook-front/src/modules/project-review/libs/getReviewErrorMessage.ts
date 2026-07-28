import { getApiErrorCode } from '@shared/api'

export const getReviewErrorMessage = (error: unknown) => {
  const code = getApiErrorCode(error)

  if (code === 'PROJECT_REVISION_CONFLICT') {
    return 'Макет изменился. Мы загрузили актуальную версию — проверьте её ещё раз.'
  }
  if (code === 'CSRF_INVALID' || code === 'SESSION_EXPIRED') {
    return 'Сессия закончилась. Войдите снова, чтобы утвердить макет.'
  }
  if (code === 'VALIDATION_FAILED') {
    return 'Проверка не завершена. Исправьте замечания и подтвердите все пункты.'
  }
  if (code === 'RESOURCE_NOT_FOUND') {
    return 'Проект или результат проверки больше недоступен.'
  }

  return 'Не удалось утвердить макет. Проверьте интернет и попробуйте ещё раз.'
}
