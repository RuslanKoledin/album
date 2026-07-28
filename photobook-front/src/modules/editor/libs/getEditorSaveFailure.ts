import { getApiErrorCode } from '@shared/api'

export const getEditorSaveFailure = (error: unknown) => {
  const code = getApiErrorCode(error)

  if (code === 'PROJECT_REVISION_CONFLICT') {
    return {
      kind: 'conflict' as const,
      message:
        'Проект изменён в другом окне. Текущая версия сохранена на устройстве.',
    }
  }
  if (
    code === 'AUTH_REQUIRED' ||
    code === 'CSRF_INVALID' ||
    code === 'SESSION_EXPIRED'
  ) {
    return {
      kind: 'session_expired' as const,
      message:
        'Сессия закончилась. Войдите снова — изменения останутся на устройстве.',
    }
  }

  return {
    kind: 'request' as const,
    message: 'Не удалось сохранить изменения. Попробуйте ещё раз.',
  }
}
