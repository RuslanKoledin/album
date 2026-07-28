export const REFERENCE_FORMAT_FACTS = [
  { label: 'Формат', value: '20 × 20 см' },
  { label: 'Переплёт', value: 'Твёрдый' },
  { label: 'Развороты', value: '1–3 в прототипе' },
  { label: 'Обложка', value: '2 тестовых варианта' },
] as const

export const FORMAT_AVAILABLE_FEATURES = [
  'Готовый редакционный шаблон',
  'Три допустимые раскладки страниц',
  'Ручная замена фотографий и подписей',
] as const

export const FORMAT_PENDING_DECISIONS = [
  {
    title: 'Материалы и печать',
    description:
      'Бумага, обложка, цвет и допуски будут подтверждены контрольным экземпляром.',
  },
  {
    title: 'Цена',
    description:
      'В конструкторе показан только демонстрационный расчёт. Публичная стоимость появится после расчёта печати, упаковки и получения.',
  },
  {
    title: 'Сроки',
    description:
      'Не называем дату изготовления и доставки, пока процесс не проверен в Бишкеке.',
  },
] as const

export const REFERENCE_BOOK_PHOTO = {
  src: '/images/demo/issyk-kul.jpg',
  alt: 'Демонстрационный снимок берега Иссык-Куля на концептуальной обложке',
} as const
