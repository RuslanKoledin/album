import { Outlet } from 'react-router'

import { RootErrorBoundary } from '@app/error-boundaries'
import { RootLayout } from '@app/layouts'

import type { Route } from './+types/root'
import './app.css'

export { RootLayout as Layout }
export { links } from '@app/config'
export { AppHydrateFallback as HydrateFallback } from '@app/ui'

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RootErrorBoundary error={error} />
}
