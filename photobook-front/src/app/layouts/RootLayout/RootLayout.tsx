import type { ReactNode } from 'react'
import { Links, Meta, Scripts, ScrollRestoration } from 'react-router'

import { StoreProvider } from '@app/providers'
import { palette } from '@shared/config'
import { ConnectionStatus } from '@shared/ui'

interface RootLayoutProps {
  children: ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={palette['paper-50']} />
        <Meta />
        <Links />
      </head>
      <body>
        <StoreProvider>
          {children}
          <ConnectionStatus />
        </StoreProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
