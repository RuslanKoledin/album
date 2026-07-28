import type { EditorSaveStatus } from './editorState'

interface EditorSaveStatusContent {
  readonly label: string
  readonly tone: string
}

export const EDITOR_SAVE_STATUS_CONTENT: Record<
  EditorSaveStatus,
  EditorSaveStatusContent
> = {
  idle: { label: 'Подготовка…', tone: 'bg-paper-100 text-ink-700' },
  saved: { label: 'Сохранено', tone: 'bg-success-soft text-success' },
  dirty: { label: 'Есть изменения', tone: 'bg-warning-soft text-warning' },
  saving: { label: 'Сохраняем…', tone: 'bg-accent-50 text-accent-700' },
  offline: {
    label: 'Сохранено на устройстве',
    tone: 'bg-warning-soft text-warning',
  },
  error: { label: 'Не сохранено', tone: 'bg-danger-soft text-danger' },
  conflict: { label: 'Нужна проверка', tone: 'bg-danger-soft text-danger' },
  session_expired: {
    label: 'Войдите снова',
    tone: 'bg-warning-soft text-warning',
  },
}
