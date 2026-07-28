import { Link } from 'react-router'

import { CenteredMessagePage } from '@shared-ui/CenteredMessagePage'

interface AppPlaceholderPageProps {
  description: string
  eyebrow: string
  title: string
}

export function AppPlaceholderPage({
  description,
  eyebrow,
  title,
}: AppPlaceholderPageProps) {
  return (
    <CenteredMessagePage
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      <Link
        className="mt-8 inline-flex rounded-full border border-control-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-paper-100"
        to="/"
      >
        Вернуться на главную
      </Link>
    </CenteredMessagePage>
  )
}
