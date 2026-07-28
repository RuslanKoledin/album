import { useOnlineStatus } from '@shared/hooks'

export function ConnectionStatus() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl rounded-2xl border border-border bg-ink-950 px-4 py-3 text-sm text-surface shadow-floating"
      role="status"
      aria-live="polite"
    >
      <span className="font-semibold">Нет подключения к интернету.</span>{' '}
      Некоторые действия временно недоступны. Подключение восстановится
      автоматически.
    </div>
  )
}
