import { Link } from 'react-router'

import { useOtpVerification } from '@auth/hooks'
import { DEVELOPMENT_AUTH_OTP } from '@auth/model'

export function OtpVerificationForm() {
  const form = useOtpVerification()

  if (!form.hasChallenge) {
    return (
      <div className="mt-8 rounded-2xl bg-warning-soft p-5">
        <p className="font-semibold text-warning">Запрос кода не найден</p>
        <p className="mt-2 text-sm leading-6 text-ink-700">
          Начните вход снова — ваши проекты и настройки не изменятся.
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
          to="/login"
        >
          Вернуться к номеру
        </Link>
      </div>
    )
  }

  return (
    <form className="mt-8" noValidate onSubmit={form.submit}>
      {form.maskedContact && (
        <p className="mb-5 rounded-2xl bg-paper-100 p-4 text-sm text-ink-700">
          Код отправлен на <strong>{form.maskedContact}</strong>
        </p>
      )}
      {import.meta.env.DEV && (
        <p className="mb-5 rounded-2xl border border-info bg-info-soft p-4 text-sm text-info">
          Код для тестового режима: <strong>{DEVELOPMENT_AUTH_OTP}</strong>
        </p>
      )}
      <label className="block text-sm font-semibold" htmlFor="login-code">
        Код из сообщения
      </label>
      <input
        aria-describedby="login-code-error login-code-notice"
        aria-invalid={Boolean(form.error)}
        autoComplete="one-time-code"
        className="mt-2 min-h-14 w-full rounded-2xl border border-control-border bg-paper-50 px-4 text-center text-2xl font-semibold tracking-[0.35em] transition-colors focus:border-accent-600 aria-invalid:border-danger"
        id="login-code"
        inputMode="numeric"
        maxLength={6}
        name="code"
        pattern="[0-9]{6}"
        placeholder="000000"
        type="text"
        value={form.code}
        onChange={(event) => form.setCode(event.target.value)}
      />
      {form.error && (
        <p
          className="mt-3 text-sm leading-6 text-danger"
          id="login-code-error"
          role="alert"
        >
          {form.error}
        </p>
      )}
      {form.notice && (
        <p
          className="mt-3 text-sm leading-6 text-success"
          id="login-code-notice"
          role="status"
        >
          {form.notice}
        </p>
      )}
      <button
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-ink-950 px-5 text-sm font-semibold text-surface transition-colors hover:bg-accent-700 disabled:cursor-wait disabled:opacity-60"
        disabled={form.isSubmitting}
        type="submit"
      >
        {form.isSubmitting ? 'Проверяем код…' : 'Войти'}
      </button>
      <button
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold text-ink-700 hover:bg-paper-100 disabled:cursor-wait disabled:opacity-60"
        disabled={form.isResending}
        type="button"
        onClick={() => void form.resendCode()}
      >
        {form.isResending ? 'Отправляем снова…' : 'Отправить новый код'}
      </button>
    </form>
  )
}
