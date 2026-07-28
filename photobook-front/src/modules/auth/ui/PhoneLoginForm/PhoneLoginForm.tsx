import { FiPhone } from 'react-icons/fi'

import { usePhoneLoginForm } from '@auth/hooks'

export function PhoneLoginForm() {
  const form = usePhoneLoginForm()

  return (
    <form className="mt-8" noValidate onSubmit={form.submit}>
      <label className="block text-sm font-semibold" htmlFor="login-phone">
        Номер телефона
      </label>
      <div className="relative mt-2">
        <FiPhone
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-500"
        />
        <input
          aria-describedby="login-phone-hint login-phone-error"
          aria-invalid={Boolean(form.error)}
          autoComplete="tel"
          className="min-h-13 w-full rounded-2xl border border-control-border bg-paper-50 pr-4 pl-11 text-base transition-colors focus:border-accent-600 aria-invalid:border-danger"
          id="login-phone"
          inputMode="tel"
          name="phone"
          placeholder="0555 123 456"
          type="tel"
          value={form.phone}
          onChange={(event) => form.setPhone(event.target.value)}
        />
      </div>
      <p className="mt-2 text-xs leading-5 text-ink-500" id="login-phone-hint">
        Можно ввести 0555 123 456 или +996 555 123 456.
      </p>
      {form.error && (
        <p
          className="mt-3 text-sm leading-6 text-danger"
          id="login-phone-error"
          role="alert"
        >
          {form.error}
        </p>
      )}
      <button
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-ink-950 px-5 text-sm font-semibold text-surface transition-colors hover:bg-accent-700 disabled:cursor-wait disabled:opacity-60"
        disabled={form.isSubmitting}
        type="submit"
      >
        {form.isSubmitting ? 'Отправляем код…' : 'Получить код'}
      </button>
      <p className="mt-4 text-center text-xs leading-5 text-ink-500">
        Продолжая, вы соглашаетесь получить одноразовое сообщение для входа.
      </p>
    </form>
  )
}
