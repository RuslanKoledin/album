import { LuShieldCheck, LuTriangleAlert } from 'react-icons/lu'

import type { LocalPreflightReport } from '@modules/preflight'

import {
  APPROVAL_CHECKLIST_ITEMS,
  type ApprovalChecklistDto,
  type ApprovalChecklistKey,
  type PreflightIssueDto,
} from '@project-review/model'
import type { ReviewSurface } from '@project-review/libs'

import { ApprovalPreflightState } from './ApprovalPreflightState'
import { ServerWarningSummary } from './ServerWarningSummary'

interface ApprovalPanelProps {
  readonly canApprove: boolean
  readonly checklist: ApprovalChecklistDto
  readonly editorPath: string
  readonly errorMessage: string | null
  readonly isOnline: boolean
  readonly isSubmitting: boolean
  readonly report: LocalPreflightReport
  readonly requiresReapproval: boolean
  readonly revisionNumber: number
  readonly reviewSurfaces: readonly ReviewSurface[]
  readonly serverWarnings: readonly PreflightIssueDto[]
  readonly warningsAcknowledged: boolean
  readonly onApprove: () => void
  readonly onToggleChecklist: (key: ApprovalChecklistKey) => void
  readonly onWarningsAcknowledgedChange: (value: boolean) => void
}

export function ApprovalPanel({
  canApprove,
  checklist,
  editorPath,
  errorMessage,
  isOnline,
  isSubmitting,
  report,
  requiresReapproval,
  revisionNumber,
  reviewSurfaces,
  serverWarnings,
  warningsAcknowledged,
  onApprove,
  onToggleChecklist,
  onWarningsAcknowledgedChange,
}: ApprovalPanelProps) {
  const checkedItemsCount = APPROVAL_CHECKLIST_ITEMS.filter(
    ({ key }) => checklist[key],
  ).length
  const totalItemsCount = APPROVAL_CHECKLIST_ITEMS.length

  return (
    <aside className="min-w-0 rounded-4xl border border-border bg-surface p-6 shadow-surface lg:sticky lg:top-6">
      <LuShieldCheck aria-hidden="true" className="text-accent-600" size={28} />
      <h2 className="mt-4 font-serif text-3xl">Итоговая проверка макета</h2>
      <p className="text-ink-600 mt-2 text-sm leading-6">
        Вы утверждаете сохранённую версию №{revisionNumber} для beta-заявки.
        После новых правок её нужно будет проверить и утвердить снова.
      </p>

      {requiresReapproval && (
        <div className="mt-5 rounded-2xl bg-warning-soft p-4 text-sm leading-6 text-warning">
          Ранее утверждённая версия была изменена. Текущий макет требует нового
          подтверждения.
        </div>
      )}

      <ApprovalPreflightState editorPath={editorPath} report={report} />

      <fieldset className="mt-6 space-y-2">
        <legend className="mb-3 text-sm font-semibold">Я проверил макет</legend>
        <p className="mb-2 text-xs leading-5 text-ink-500">
          Отмечено {checkedItemsCount} из {totalItemsCount}. Кнопка оформления
          откроется после всех обязательных пунктов.
        </p>
        {APPROVAL_CHECKLIST_ITEMS.map(({ key, label }) => (
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm hover:bg-paper-100"
            key={key}
          >
            <input
              checked={checklist[key]}
              className="size-5 accent-ink-950"
              name={key}
              type="checkbox"
              onChange={() => onToggleChecklist(key)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      {serverWarnings.length > 0 && (
        <>
          <ServerWarningSummary
            issues={serverWarnings}
            surfaces={reviewSurfaces}
          />
          <label className="mt-3 flex min-h-11 cursor-pointer gap-3 rounded-2xl border border-warning/30 p-3 text-sm leading-6 text-ink-700">
            <input
              checked={warningsAcknowledged}
              className="mt-1 size-5 shrink-0 accent-ink-950"
              type="checkbox"
              onChange={(event) =>
                onWarningsAcknowledgedChange(event.currentTarget.checked)
              }
            />
            <span>Я ознакомился с рекомендациями и принимаю результат.</span>
          </label>
        </>
      )}

      {!isOnline && (
        <p className="mt-5 flex gap-2 text-sm text-warning" role="status">
          <LuTriangleAlert aria-hidden="true" className="shrink-0" size={18} />
          Для утверждения восстановите подключение к интернету.
        </p>
      )}
      {errorMessage && (
        <p className="mt-5 text-sm leading-6 text-danger" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        className="mt-6 min-h-12 w-full rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canApprove}
        type="button"
        onClick={onApprove}
      >
        {isSubmitting ? 'Проверяем макет…' : 'Утвердить для beta-заявки'}
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-ink-500">
        Утверждение фиксирует именно эту версию макета.
      </p>
    </aside>
  )
}
