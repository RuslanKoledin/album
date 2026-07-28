import { Link } from 'react-router'
import { LuBadgeCheck } from 'react-icons/lu'

interface ApprovedRevisionPanelProps {
  readonly projectId: string
  readonly revisionNumber: number
}

export function ApprovedRevisionPanel({
  projectId,
  revisionNumber,
}: ApprovedRevisionPanelProps) {
  return (
    <aside className="min-w-0 rounded-4xl border border-success bg-success-soft p-6 lg:sticky lg:top-6">
      <LuBadgeCheck aria-hidden="true" className="text-success" size={32} />
      <h2 className="mt-4 font-serif text-3xl">Макет утверждён</h2>
      <p className="mt-3 text-sm leading-6 text-ink-700">
        Версия №{revisionNumber} зафиксирована для beta-заявки. Новые изменения
        в редакторе потребуют повторной проверки.
      </p>
      <Link
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
        to={`/checkout/${encodeURIComponent(projectId)}`}
      >
        Перейти к оформлению
      </Link>
    </aside>
  )
}
