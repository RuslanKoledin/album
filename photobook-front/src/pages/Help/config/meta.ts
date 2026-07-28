import type { MetaFunction } from 'react-router'

import { createPublicPageMeta } from '@shared/seo'

export const meta: MetaFunction = () =>
  createPublicPageMeta({
    title: 'Как создать фотокнигу — помощь | Photobook',
    description:
      'Как подготовить фотографии, собрать и проверить beta-макет фотокниги в Photobook. Ограничения текущей версии для Бишкека.',
    path: '/help',
  })
