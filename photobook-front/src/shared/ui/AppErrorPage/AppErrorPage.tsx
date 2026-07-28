import { Link } from 'react-router'

import { CenteredMessagePage } from '@shared-ui/CenteredMessagePage'

interface AppErrorPageProps {
  description: string
  title: string
}

export function AppErrorPage({ description, title }: AppErrorPageProps) {
  const reloadPage = () => {
    window.location.reload()
  }

  return (
    <CenteredMessagePage
      eyebrow="Photobook"
      title={title}
      description={description}
    >
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-ink-950 px-5 py-2.5 text-sm font-medium text-surface transition-colors hover:bg-accent-600"
          type="button"
          onClick={reloadPage}
        >
          Обновить страницу
        </button>
        <Link
          className="rounded-full border border-control-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-paper-100"
          to="/"
        >
          Вернуться на главную
        </Link>
      </div>
    </CenteredMessagePage>
  )
}
