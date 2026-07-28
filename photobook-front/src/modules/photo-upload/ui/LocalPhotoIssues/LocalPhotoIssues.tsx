import { FiAlertCircle, FiX } from 'react-icons/fi'

import { getLocalPhotoIssueMessage } from '@photo-upload/libs'
import type { LocalPhotoIssue } from '@photo-upload/model'

interface LocalPhotoIssuesProps {
  readonly issues: readonly LocalPhotoIssue[]
  readonly onDismiss: () => void
}

export function LocalPhotoIssues({ issues, onDismiss }: LocalPhotoIssuesProps) {
  if (issues.length === 0) return null

  return (
    <section
      aria-labelledby="local-photo-issues-title"
      className="mt-5 rounded-2xl border border-warning bg-warning-soft p-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <FiAlertCircle
          aria-hidden="true"
          className="mt-1 shrink-0 text-warning"
        />
        <div className="min-w-0 flex-1">
          <h2 id="local-photo-issues-title" className="text-sm font-semibold">
            Некоторые файлы не добавлены
          </h2>
          <ul className="mt-2 space-y-2 text-sm leading-5 text-ink-700">
            {issues.map((issue, index) => (
              <li key={`${issue.fileName}-${issue.code}-${index}`}>
                <span className="font-medium break-all">{issue.fileName}</span>
                {` — ${getLocalPhotoIssueMessage(issue.code)}`}
              </li>
            ))}
          </ul>
        </div>
        <button
          aria-label="Скрыть сообщения о файлах"
          className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-paper-100"
          type="button"
          onClick={onDismiss}
        >
          <FiX aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
