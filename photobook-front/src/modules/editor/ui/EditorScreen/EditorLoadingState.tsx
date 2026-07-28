export function EditorLoadingState() {
  return (
    <main
      aria-busy="true"
      className="flex min-h-dvh items-center justify-center bg-paper-100 px-4"
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 text-center shadow-surface">
        <div className="mx-auto size-10 animate-pulse rounded-full bg-accent-100" />
        <p className="mt-5 font-semibold">Открываем вашу книгу…</p>
        <p className="mt-2 text-sm text-ink-500">
          Загружаем страницы и настройки печати.
        </p>
      </div>
    </main>
  )
}
