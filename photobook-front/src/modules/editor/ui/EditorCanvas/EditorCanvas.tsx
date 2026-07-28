import type { BookSurface, ThemeSpec } from '@core/book'

import { BookSurfaceRenderer } from '@editor-ui/BookSurfaceRenderer'
import type { PhotoAdjustmentPreview } from '@editor/libs'
import type { EditorSaveStatus } from '@editor/model'

interface EditorCanvasProps {
  readonly activeSurfaceLabel: string
  readonly mobilePropertiesOpen: boolean
  readonly onRetrySave: () => void
  readonly onSelectElement: (id: string, kind: 'photo' | 'text') => void
  readonly photoAdjustmentPreview: PhotoAdjustmentPreview | null
  readonly photoSources: Readonly<Record<string, string>>
  readonly saveError: string | null
  readonly saveStatus: EditorSaveStatus
  readonly selectedElementId: string | null
  readonly surface: BookSurface
  readonly theme: ThemeSpec | undefined
}

const mobileStatus: Partial<Record<EditorSaveStatus, string>> = {
  dirty: 'Изменения сохранятся автоматически',
  saving: 'Сохраняем изменения…',
  offline: 'Нет сети — изменения сохранены на устройстве',
  error: 'Не удалось сохранить. Работа осталась на устройстве.',
  conflict: 'Проект изменён в другом окне. Работа сохранена на устройстве.',
  session_expired: 'Сессия закончилась. Работа сохранена на устройстве.',
}

export function EditorCanvas({
  activeSurfaceLabel,
  mobilePropertiesOpen,
  onRetrySave,
  onSelectElement,
  photoAdjustmentPreview,
  photoSources,
  saveError,
  saveStatus,
  selectedElementId,
  surface,
  theme,
}: EditorCanvasProps) {
  const statusMessage = mobileStatus[saveStatus]

  return (
    <main className="order-1 flex min-h-0 min-w-0 flex-col bg-paper-100 md:order-none">
      <div className="flex min-h-12 items-center justify-between px-4 text-xs font-medium text-ink-500 sm:px-6">
        <span>{activeSurfaceLabel}</span>
        <span className="hidden sm:inline">Масштаб по размеру окна</span>
      </div>

      {statusMessage && (
        <div
          aria-live="polite"
          className="mx-3 mb-3 flex min-h-11 items-center justify-between gap-3 rounded-xl bg-warning-soft px-3 py-2 text-xs font-medium text-warning sm:hidden"
          role="status"
        >
          <span>{statusMessage}</span>
          {(saveStatus === 'error' || saveStatus === 'session_expired') && (
            <button
              className="min-h-9 shrink-0 rounded-lg border border-warning px-3 font-semibold"
              type="button"
              onClick={onRetrySave}
            >
              {saveStatus === 'session_expired' ? 'Войти' : 'Повторить'}
            </button>
          )}
        </div>
      )}

      <div
        className={`flex min-h-80 flex-1 justify-center overflow-auto px-4 py-6 sm:items-center sm:px-8 sm:py-10 ${mobilePropertiesOpen ? 'items-start' : 'items-center'}`}
      >
        <div className="w-full max-w-2xl rounded-3xl bg-paper-200 p-5 sm:p-10 lg:p-14">
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-sm bg-surface shadow-book sm:max-w-md lg:max-w-xl">
            <BookSurfaceRenderer
              onSelectElement={onSelectElement}
              photoAdjustmentPreview={photoAdjustmentPreview}
              photoSources={photoSources}
              selectedElementId={selectedElementId}
              surface={surface}
              theme={theme}
            />
          </div>
        </div>
      </div>

      <p className="hidden px-6 py-4 text-center text-xs text-ink-500 sm:block">
        Нажмите на фотографию или текст, чтобы открыть его свойства.
        {saveError ? ` ${saveError}` : ''}
      </p>
    </main>
  )
}
