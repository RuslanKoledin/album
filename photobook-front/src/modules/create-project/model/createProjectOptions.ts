import type {
  CreateCategoryOption,
  CreatePhotoSet,
  CreatePresentation,
} from './createProjectFlow'

export const CREATE_CATEGORY_OPTIONS: readonly CreateCategoryOption[] = [
  { id: 'family', label: 'Семья' },
  { id: 'wedding', label: 'Свадьба и Той' },
  { id: 'children', label: 'Дети' },
  { id: 'travel', label: 'Путешествие' },
  { id: 'school', label: 'Выпускной и школа' },
  { id: 'portfolio', label: 'Портфолио' },
  { id: 'gift', label: 'Подарок' },
  { id: 'other', label: 'Другое' },
]

export const CREATE_PRESENTATION: CreatePresentation = {
  productName: 'Фотокнига в твёрдом переплёте',
  productDescription:
    'Универсальная фотокнига в твёрдом переплёте с матовой обложкой.',
  templateName: 'Тёплая история',
  templateDescription:
    'Спокойная журнальная композиция с крупными фотографиями и короткими подписями.',
}

export const COVER_VALUE_LABELS: Readonly<Record<string, string>> = {
  'mock-cover-material-sand': 'Песочный',
  'mock-cover-material-linen': 'Светлый лён',
}

export const SEEDED_PHOTO_SET: CreatePhotoSet = {
  id: 'seeded-family-demo-v0',
  name: 'Демонстрационная семейная история',
  description:
    'Четыре демонстрационных снимка для обложки и первых разворотов.',
  assetIds: [
    'mock-asset-cover',
    'mock-asset-spread-01',
    'mock-asset-extra-01',
    'mock-asset-extra-02',
  ],
}

export const SEEDED_PHOTO_PREVIEWS = [
  {
    src: '/images/demo/family-mountains.jpg',
    alt: 'Семья на прогулке в горах',
  },
  { src: '/images/demo/family-table.jpg', alt: 'Семейное чаепитие' },
  { src: '/images/demo/issyk-kul.jpg', alt: 'Берег Иссык-Куля' },
  {
    src: '/images/demo/child-wildflowers.jpg',
    alt: 'Ребёнок с полевыми цветами',
  },
] as const
