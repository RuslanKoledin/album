import type { MetaFunction } from 'react-router'

import { createPublicPageMeta } from '@shared/seo'

export const meta: MetaFunction = () =>
  createPublicPageMeta({
    title: 'Формат фотокниги и тестовая конфигурация | Photobook',
    description:
      'Посмотрите референсный формат фотокниги Photobook. Тестовые параметры отделены от ещё не подтверждённых цены, материалов и сроков.',
    path: '/books',
  })
