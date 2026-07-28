import { FiAlertTriangle } from 'react-icons/fi'

import { getPreflightIssuePresentation } from '@preflight/libs'
import type { LocalPreflightIssue } from '@preflight/model'

interface PreflightIssueListProps {
  readonly issues: readonly LocalPreflightIssue[]
  readonly onSelectIssue: (issue: LocalPreflightIssue) => void
}

export function PreflightIssueList({
  issues,
  onSelectIssue,
}: PreflightIssueListProps) {
  return (
    <ul className="max-h-56 space-y-2 overflow-y-auto border-t border-border px-3 py-3 sm:px-6">
      {issues.map((issue) => {
        const presentation = getPreflightIssuePresentation(issue)
        const canOpen = issue.surfaceId !== null

        return (
          <li key={issue.id}>
            <button
              className="flex min-h-11 w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-paper-100 disabled:cursor-default disabled:hover:bg-transparent"
              disabled={!canOpen}
              type="button"
              onClick={() => onSelectIssue(issue)}
            >
              <FiAlertTriangle
                aria-hidden="true"
                className={`mt-1 shrink-0 ${issue.severity === 'error' ? 'text-danger' : 'text-warning'}`}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold tracking-[0.08em] text-ink-500 uppercase">
                  {presentation.surfaceLabel}
                </span>
                <span className="mt-1 block text-sm font-semibold">
                  {presentation.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-ink-700">
                  {presentation.description}
                </span>
              </span>
              {canOpen && (
                <span className="shrink-0 pt-1 text-xs font-semibold text-accent-600">
                  Открыть
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
