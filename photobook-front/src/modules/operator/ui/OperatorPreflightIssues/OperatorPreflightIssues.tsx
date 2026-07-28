import { LuCircleAlert, LuCircleCheck } from 'react-icons/lu'

import type { PreflightRunDto } from '@modules/project-review'

import { getPreflightIssueLabel } from '@operator/libs'

interface OperatorPreflightIssuesProps {
  readonly run: PreflightRunDto
}

export function OperatorPreflightIssues({ run }: OperatorPreflightIssuesProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-surface">
      <div className="flex items-start gap-3">
        {run.issues.length === 0 ? (
          <LuCircleCheck
            aria-hidden="true"
            className="mt-1 text-success"
            size={22}
          />
        ) : (
          <LuCircleAlert
            aria-hidden="true"
            className="mt-1 text-warning"
            size={22}
          />
        )}
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-accent-600 uppercase">
            Server preflight · mock
          </p>
          <h2 className="mt-2 font-serif text-3xl">
            {run.issues.length === 0
              ? 'Замечаний нет'
              : `Замечаний: ${run.issues.length}`}
          </h2>
        </div>
      </div>
      {run.issues.length > 0 && (
        <ul className="mt-5 grid gap-3">
          {run.issues.map((issue) => (
            <li
              key={issue.id}
              className="rounded-2xl bg-warning-soft p-4 text-sm leading-6"
            >
              <p className="font-semibold">{getPreflightIssueLabel(issue)}</p>
              <p className="mt-1 text-ink-700">
                {issue.surfaceId ? `Страница: ${issue.surfaceId}. ` : ''}
                {issue.details.actualDpi
                  ? `Фактически ${issue.details.actualDpi} DPI, требуется ${issue.details.requiredDpi} DPI.`
                  : 'Нужно проверить отмеченный элемент.'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
