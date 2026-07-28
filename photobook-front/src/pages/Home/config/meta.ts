import type { MetaFunction } from 'react-router'

import { createPublicPageMeta } from '@shared/seo'

import { HOME_STRUCTURED_DATA } from './structuredData'

export const meta: MetaFunction = () =>
  createPublicPageMeta({
    title: 'Фотокнига в Бишкеке — онлайн-конструктор | Photobook',
    description:
      'Соберите фотокнигу в Бишкеке: выберите готовый макет, добавьте фотографии и настройте страницы в понятном онлайн-конструкторе.',
    path: '/',
    structuredData: HOME_STRUCTURED_DATA,
  })
