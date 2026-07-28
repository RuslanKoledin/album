import type { MetaFunction } from 'react-router'

export const meta: MetaFunction = () => [
  { title: 'Вход | Photobook' },
  { name: 'robots', content: 'noindex, nofollow' },
]

export const verifyMeta: MetaFunction = () => [
  { title: 'Подтверждение входа | Photobook' },
  { name: 'robots', content: 'noindex, nofollow' },
]
