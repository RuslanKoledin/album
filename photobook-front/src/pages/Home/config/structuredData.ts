export const HOME_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Photobook',
  description:
    'Онлайн-конструктор фотокниг с готовыми макетами и ручным редактированием страниц.',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  inLanguage: 'ru-KG',
  areaServed: {
    '@type': 'City',
    name: 'Бишкек',
  },
} as const
