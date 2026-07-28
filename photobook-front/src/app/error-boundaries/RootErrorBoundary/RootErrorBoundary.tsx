import { getPublicErrorContent } from '@shared/lib'
import { AppErrorPage } from '@shared/ui'

interface RootErrorBoundaryProps {
  error: unknown
}

export function RootErrorBoundary({ error }: RootErrorBoundaryProps) {
  const content = getPublicErrorContent(error)

  return <AppErrorPage {...content} />
}
