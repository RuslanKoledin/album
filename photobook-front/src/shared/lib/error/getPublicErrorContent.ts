export interface PublicErrorContent {
  description: string
  title: string
}

const isErrorWithStatus = (error: unknown): error is { status: number } =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  typeof error.status === 'number'

export function getPublicErrorContent(error: unknown): PublicErrorContent {
  if (isErrorWithStatus(error) && error.status === 404) {
    return {
      title: 'Страница не найдена',
      description: 'Проверьте адрес или вернитесь на главную страницу.',
    }
  }

  return {
    title: 'Что-то пошло не так',
    description:
      'Не удалось открыть страницу. Обновите её или вернитесь на главную.',
  }
}
