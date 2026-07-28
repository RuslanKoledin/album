import type { MetaFunction } from 'react-router'

import { createPublicPageMeta } from '@shared/seo'

export const meta: MetaFunction = () =>
  createPublicPageMeta({
    title: 'Как создать фотокнигу — помощь | Photobook',
    description:
      'Как подготовить фотографии, собрать и проверить тестовый макет фотокниги в Photobook. Честные ограничения прототипа для Бишкека.',
    path: '/help',
  })
