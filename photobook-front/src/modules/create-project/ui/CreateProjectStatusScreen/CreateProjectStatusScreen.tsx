import { Link } from 'react-router'
import { FiArrowLeft } from 'react-icons/fi'

interface CreateProjectStatusScreenProps {
  readonly description: string
  readonly isLoading?: boolean
  readonly onRetry?: () => void
  readonly title: string
}

export function CreateProjectStatusScreen({
  description,
  isLoading = false,
  onRetry,
  title,
}: CreateProjectStatusScreenProps) {
  return (
    <main className="page-container flex min-h-dvh items-center py-12">
      <section
        aria-busy={isLoading}
        className="w-full max-w-2xl rounded-4xl border border-border bg-surface p-8 shadow-surface sm:p-12"
      >
        <Link
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink-700"
          to="/"
        >
          <FiArrowLeft aria-hidden="true" />
          На главную
        </Link>
        <p className="mt-10 text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
          Новый проект
        </p>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl leading-7 text-ink-700">{description}</p>
        {isLoading ? (
          <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-paper-200">
            <div className="h-full w-2/5 animate-pulse rounded-full bg-accent-500" />
          </div>
        ) : null}
        {onRetry ? (
          <button
            className="mt-8 min-h-11 rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface hover:bg-accent-700"
            type="button"
            onClick={onRetry}
          >
            Повторить
          </button>
        ) : null}
      </section>
    </main>
  )
}
