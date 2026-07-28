import { useState } from 'react'
import { FiAlertTriangle, FiCheckCircle, FiChevronDown } from 'react-icons/fi'

import { getPreflightSummaryPresentation } from '@preflight/libs'
import type {
  LocalPreflightIssue,
  LocalPreflightReport,
} from '@preflight/model'

import { PreflightIssueList } from './PreflightIssueList'

interface LocalPreflightSummaryProps {
  readonly onSelectIssue: (issue: LocalPreflightIssue) => void
  readonly report: LocalPreflightReport
}

export function LocalPreflightSummary({
  onSelectIssue,
  report,
}: LocalPreflightSummaryProps) {
  const [expanded, setExpanded] = useState(false)
  const presentation = getPreflightSummaryPresentation(report)
  const hasIssues = report.issues.length > 0
  const isReady = presentation.tone === 'ready'

  return (
    <section
      aria-label="Предварительная проверка макета"
      className="border-b border-border bg-surface"
    >
      <div className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-6">
        {isReady ? (
          <FiCheckCircle
            aria-hidden="true"
            className="size-5 shrink-0 text-success"
          />
        ) : (
          <FiAlertTriangle
            aria-hidden="true"
            className={`size-5 shrink-0 ${presentation.tone === 'error' ? 'text-danger' : 'text-warning'}`}
          />
        )}
        <div aria-live="polite" className="min-w-0 flex-1" role="status">
          <p className="text-xs font-semibold tracking-[0.1em] text-ink-500 uppercase">
            Предварительная проверка
          </p>
          <p className="mt-0.5 text-sm font-semibold">{presentation.title}</p>
          <p className="mt-0.5 hidden text-xs text-ink-700 sm:block">
            {presentation.description}
          </p>
        </div>
        {hasIssues && (
          <button
            aria-expanded={expanded}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-control-border px-4 text-xs font-semibold"
            type="button"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Скрыть' : 'Показать'}
            <FiChevronDown
              aria-hidden="true"
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {expanded && (
        <>
          <PreflightIssueList
            issues={report.issues}
            onSelectIssue={onSelectIssue}
          />
          <p className="border-t border-border px-6 py-3 text-xs leading-5 text-ink-500">
            Это локальная проверка прототипа. Перед утверждением потребуется
            серверная предпечатная проверка.
          </p>
        </>
      )}
    </section>
  )
}
