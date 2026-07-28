import { describe, expect, it } from 'vitest'

import { getPublicErrorContent } from './getPublicErrorContent'

describe('getPublicErrorContent', () => {
  it('returns a useful recovery message for a missing route', () => {
    expect(getPublicErrorContent({ status: 404 })).toEqual({
      title: 'Страница не найдена',
      description: 'Проверьте адрес или вернитесь на главную страницу.',
    })
  })

  it('does not expose technical error details', () => {
    const content = getPublicErrorContent(
      Object.assign(new Error('SQL connection refused'), {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    )

    expect(content).toEqual({
      title: 'Что-то пошло не так',
      description:
        'Не удалось открыть страницу. Обновите её или вернитесь на главную.',
    })
    expect(JSON.stringify(content)).not.toMatch(
      /SQL|connection refused|Internal Server Error|500/,
    )
  })
})
