import { Link } from 'react-router'
import { LuCircleCheck, LuTriangleAlert } from 'react-icons/lu'

import {
  getPreflightIssuePresentation,
  getPreflightSummaryPresentation,
  type LocalPreflightReport,
} from '@modules/preflight'

interface ApprovalPreflightStateProps {
  readonly editorPath: string
  readonly report: LocalPreflightReport
}

export function ApprovalPreflightState({
  editorPath,
  report,
}: ApprovalPreflightStateProps) {
  const presentation = getPreflightSummaryPresentation(report)
  const isReady = presentation.tone === 'ready'
  const tone =
    presentation.tone === 'error'
      ? 'bg-danger-soft text-danger'
      : presentation.tone === 'warning'
        ? 'bg-warning-soft text-warning'
        : 'bg-success-soft text-success'

  return (
    <div className={`mt-6 rounded-2xl p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        {isReady ? (
          <LuCircleCheck
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={20}
          />
        ) : (
          <LuTriangleAlert
            aria-hidden="true"
            className="mt-0.5 shrink-0"
            size={20}
          />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold">{presentation.title}</p>
          <p className="mt-1 text-sm leading-6 text-ink-700">
            {presentation.description}
          </p>
        </div>
      </div>

      {report.issues.length > 0 && (
        <ul className="mt-4 space-y-3 border-t border-current/20 pt-4 text-ink-700">
          {report.issues.map((issue) => {
            const issueContent = getPreflightIssuePresentation(issue)

            return (
              <li className="text-xs leading-5" key={issue.id}>
                <span className="font-semibold">
                  {issueContent.surfaceLabel}: {issueContent.title}
                </span>
                <span className="mt-0.5 block">{issueContent.description}</span>
              </li>
            )
          })}
        </ul>
      )}

      {!isReady && (
        <Link
          className="mt-4 inline-flex min-h-11 items-center rounded-full border border-current px-4 text-xs font-semibold"
          to={editorPath}
        >
          Вернуться и проверить
        </Link>
      )}
    </div>
  )
}
