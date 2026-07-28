import type { PreflightIssueDto } from '@project-review/model'
import {
  getServerWarningPresentation,
  type ReviewSurface,
} from '@project-review/libs'

interface ServerWarningSummaryProps {
  readonly issues: readonly PreflightIssueDto[]
  readonly surfaces: readonly ReviewSurface[]
}

export function ServerWarningSummary({
  issues,
  surfaces,
}: ServerWarningSummaryProps) {
  return (
    <section
      aria-labelledby="server-warning-title"
      className="mt-5 rounded-2xl bg-warning-soft p-4 text-ink-700"
    >
      <h3 className="text-sm font-semibold" id="server-warning-title">
        Рекомендации дополнительной проверки
      </h3>
      <p className="mt-1 text-xs leading-5">
        Сервис повторно проверил сохранённую версию. Ознакомьтесь с результатом
        перед утверждением.
      </p>
      <ul className="mt-3 space-y-3 border-t border-warning/20 pt-3">
        {issues.map((issue) => {
          const presentation = getServerWarningPresentation(issue, surfaces)

          return (
            <li className="text-xs leading-5" key={issue.id}>
              <span className="font-semibold">{presentation.title}</span>
              <span className="mt-0.5 block">{presentation.description}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
