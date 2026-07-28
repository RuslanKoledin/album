import { Link } from 'react-router'

import type { OperatorOrderDetailDto } from '@operator/model'
import { formatOperatorDate } from '@operator/libs'

interface OperatorProjectReviewProps {
  readonly detail: OperatorOrderDetailDto
}

export function OperatorProjectReview({ detail }: OperatorProjectReviewProps) {
  const { approval, approvedRevision, project } = detail

  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <p className="text-xs font-semibold tracking-[0.15em] text-accent-600 uppercase">
        Утверждённый макет
      </p>
      <h2 className="mt-3 font-serif text-3xl">{project.title}</h2>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-500">Revision</dt>
          <dd className="mt-1 font-semibold break-all">
            {approvedRevision.id}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Версия</dt>
          <dd className="mt-1 font-semibold">
            {approvedRevision.revisionNumber}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Document hash</dt>
          <dd className="mt-1 font-mono text-xs break-all">
            {approvedRevision.documentHash}
          </dd>
        </div>
        <div>
          <dt className="text-ink-500">Утверждён</dt>
          <dd className="mt-1 font-semibold">
            {formatOperatorDate(approval.approvedAt)}
          </dd>
        </div>
      </dl>
      <Link
        className="mt-6 inline-flex min-h-11 items-center rounded-full border border-control-border px-4 text-sm font-semibold hover:bg-paper-100"
        to={`/projects/${encodeURIComponent(project.id)}/preview`}
      >
        Открыть клиентский preview
      </Link>
    </section>
  )
}
