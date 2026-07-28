import { FiLock, FiRefreshCw } from 'react-icons/fi'

interface CreatePhotoAccessStateProps {
  readonly isError: boolean
  readonly isLoading: boolean
  readonly onBack: () => void
  readonly onRetry: () => void
  readonly onSignIn: () => void
}

export function CreatePhotoAccessState({
  isError,
  isLoading,
  onBack,
  onRetry,
  onSignIn,
}: CreatePhotoAccessStateProps) {
  return (
    <section aria-busy={isLoading} aria-labelledby="photo-access-title">
      <p className="text-xs font-semibold tracking-[0.18em] text-accent-600 uppercase">
        Шаг 4 из 4
      </p>
      <FiLock aria-hidden="true" className="mt-8 text-3xl text-accent-600" />
      <h1
        id="photo-access-title"
        className="mt-4 font-serif text-4xl sm:text-5xl"
      >
        {isLoading ? 'Проверяем вход…' : 'Войдите перед добавлением фото'}
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-ink-700">
        Выбор продукта, шаблона и комплектации сохранён в адресе страницы. После
        входа вы вернётесь точно к этому шагу.
      </p>

      {isError ? (
        <div className="mt-6 rounded-2xl border border-danger bg-danger-soft p-4 text-sm leading-6">
          Не удалось проверить сессию. Проверьте подключение и повторите.
        </div>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
        <button
          className="min-h-12 rounded-full border border-control-border bg-surface px-6 text-sm font-semibold hover:bg-paper-100"
          type="button"
          onClick={onBack}
        >
          Назад к настройкам
        </button>
        {isError ? (
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface hover:bg-accent-700"
            type="button"
            onClick={onRetry}
          >
            <FiRefreshCw aria-hidden="true" />
            Повторить проверку
          </button>
        ) : null}
        {!isLoading && !isError ? (
          <button
            className="min-h-12 rounded-full bg-ink-950 px-6 text-sm font-semibold text-surface hover:bg-accent-700"
            type="button"
            onClick={onSignIn}
          >
            Войти и продолжить
          </button>
        ) : null}
      </div>
    </section>
  )
}
