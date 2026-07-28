import type { LinksFunction } from 'react-router'

import interRegularUrl from '@shared/config/styles/fonts/inter/Inter-Regular.woff2?url'

export const links: LinksFunction = () => [
  {
    rel: 'preload',
    href: interRegularUrl,
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  },
]
