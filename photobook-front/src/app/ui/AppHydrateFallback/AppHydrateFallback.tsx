export function AppHydrateFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper-50 px-6">
      <div className="max-w-md text-center" role="status">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
          Photobook
        </p>
        <p className="mt-3 font-serif text-3xl">Открываем страницу…</p>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          Загружаем сохранённые данные и настройки книги.
        </p>
      </div>
    </main>
  )
}
