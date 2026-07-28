export const HOME_PATH_STEPS = [
  {
    number: '01',
    title: 'Выберите основу',
    description:
      'Начните с готового формата и спокойного редакционного шаблона.',
  },
  {
    number: '02',
    title: 'Добавьте фотографии',
    description:
      'Выберите снимки с телефона или компьютера — они останутся вашей историей.',
  },
  {
    number: '03',
    title: 'Настройте страницы',
    description:
      'Меняйте раскладку, фотографии и подписи в ограниченном конструкторе.',
  },
] as const

export const HOME_CONSTRUCTOR_FEATURES = [
  'Готовые макеты вместо пустого холста',
  'Ручная настройка каждой страницы',
  'Понятные параметры макета в одном месте',
] as const

export const HOME_CATEGORY_EXAMPLES = [
  'семья',
  'свадьба и той',
  'дети',
  'путешествие',
  'выпускной',
  'подарок',
] as const

export const REFERENCE_PRODUCT_FEATURES = [
  'Квадратный формат 20 × 20 см',
  'Твёрдая обложка в двух тестовых вариантах',
  'До трёх разворотов в текущем прототипе',
] as const

export const HOME_DEMO_PHOTOS = {
  family: {
    src: '/images/demo/family-mountains.jpg',
    alt: 'Демонстрационный снимок семьи на прогулке в горах',
  },
  table: {
    src: '/images/demo/family-table.jpg',
    alt: 'Демонстрационный снимок семейного чаепития',
  },
  lake: {
    src: '/images/demo/issyk-kul.jpg',
    alt: 'Демонстрационный снимок берега Иссык-Куля',
  },
  flowers: {
    src: '/images/demo/child-wildflowers.jpg',
    alt: 'Демонстрационный снимок ребёнка с полевыми цветами',
  },
} as const
