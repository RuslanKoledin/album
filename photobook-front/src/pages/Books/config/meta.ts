import type { MetaFunction } from 'react-router'

import { createPublicPageMeta } from '@shared/seo'

export const meta: MetaFunction = () =>
  createPublicPageMeta({
    title: 'Форматы фотокниги и beta-конфигурация | Photobook',
    description:
      'Посмотрите первый beta-формат Photobook и ближайшие форматы-кандидаты для проверки с типографией.',
    path: '/books',
  })
