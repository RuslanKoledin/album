import { Link } from 'react-router'
import { LuArrowLeft, LuEye, LuRedo2, LuUndo2 } from 'react-icons/lu'

import {
  EDITOR_SAVE_STATUS_CONTENT,
  type EditorSaveStatus,
} from '@editor/model'

import { EditableProjectTitle } from './EditableProjectTitle'

interface EditorToolbarProps {
  readonly canRedo: boolean
  readonly canUndo: boolean
  readonly onRedo: () => void
  readonly onRetrySave: () => void
  readonly onTitleChange: (title: string) => void
  readonly onUndo: () => void
  readonly projectTitle: string
  readonly projectId: string
  readonly saveStatus: EditorSaveStatus
}

export function EditorToolbar({
  canRedo,
  canUndo,
  onRedo,
  onRetrySave,
  onTitleChange,
  onUndo,
  projectTitle,
  projectId,
  saveStatus,
}: EditorToolbarProps) {
  const status = EDITOR_SAVE_STATUS_CONTENT[saveStatus]
  const canRetry = saveStatus === 'error' || saveStatus === 'session_expired'
  const canPreview = saveStatus === 'idle' || saveStatus === 'saved'

  return (
    <header className="flex min-h-16 items-center gap-2 border-b border-border bg-surface px-3 sm:px-5">
      <Link
        aria-label="Вернуться к проектам"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-lg transition-colors hover:bg-paper-100"
        to="/account"
      >
        <LuArrowLeft aria-hidden="true" size={20} />
      </Link>

      <div className="min-w-0 flex-1 sm:max-w-sm">
        <h1>
          <EditableProjectTitle
            key={projectTitle}
            title={projectTitle}
            onChange={onTitleChange}
          />
        </h1>
        <p className="truncate text-xs text-ink-500">
          <span className="sm:hidden">{status.label}</span>
          <span className="hidden sm:inline">Фотокнига · 20 × 20 см</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="Отменить изменение"
          className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-lg transition-colors hover:bg-paper-100 disabled:opacity-40"
          disabled={!canUndo}
          type="button"
          onClick={onUndo}
        >
          <LuUndo2 aria-hidden="true" size={20} />
        </button>
        <button
          aria-label="Вернуть изменение"
          className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-lg transition-colors hover:bg-paper-100 disabled:opacity-40"
          disabled={!canRedo}
          type="button"
          onClick={onRedo}
        >
          <LuRedo2 aria-hidden="true" size={20} />
        </button>
      </div>

      {canPreview ? (
        <Link
          aria-label="Открыть предпросмотр"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink-950 px-3 text-sm font-semibold text-surface sm:px-4"
          to={`/projects/${encodeURIComponent(projectId)}/preview`}
        >
          <LuEye aria-hidden="true" size={19} />
          <span className="hidden lg:inline">Предпросмотр</span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink-950 px-3 text-sm font-semibold text-surface opacity-40 sm:px-4"
          title="Сначала дождитесь сохранения"
        >
          <LuEye aria-hidden="true" size={19} />
          <span className="hidden lg:inline">Предпросмотр</span>
        </span>
      )}

      {canRetry ? (
        <button
          className={`hidden min-h-10 items-center rounded-full px-4 text-xs font-semibold sm:inline-flex ${status.tone}`}
          type="button"
          onClick={onRetrySave}
        >
          {saveStatus === 'session_expired'
            ? 'Войти снова'
            : 'Повторить сохранение'}
        </button>
      ) : (
        <div
          aria-live="polite"
          className={`hidden min-h-10 items-center rounded-full px-4 text-xs font-semibold sm:inline-flex ${status.tone}`}
          role="status"
        >
          {status.label}
        </div>
      )}
    </header>
  )
}
