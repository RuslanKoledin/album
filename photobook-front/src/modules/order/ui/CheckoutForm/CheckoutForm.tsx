import type {
  CheckoutFormErrors,
  CheckoutFormState,
  DeliveryMethod,
} from '@order/model'

interface CheckoutFormProps {
  readonly canSubmit: boolean
  readonly errorMessage: string | null
  readonly errors: CheckoutFormErrors
  readonly form: CheckoutFormState
  readonly isOnline: boolean
  readonly isSubmitting: boolean
  readonly onChange: <Key extends keyof CheckoutFormState>(
    key: Key,
    value: CheckoutFormState[Key],
  ) => void
  readonly onSubmit: () => void
}

const fieldClassName =
  'mt-2 min-h-12 w-full rounded-xl border border-control-border bg-surface px-4 text-base outline-none focus:border-ink-950'

const deliveryOptions = [
  ['pickup', 'Самовывоз', 'Адрес точки добавим после выбора партнёра'],
  ['courier', 'Курьер', 'По Бишкеку после согласования заявки'],
] as const

export function CheckoutForm({
  canSubmit,
  errorMessage,
  errors,
  form,
  isOnline,
  isSubmitting,
  onChange,
  onSubmit,
}: CheckoutFormProps) {
  const setDeliveryMethod = (method: DeliveryMethod) =>
    onChange('deliveryMethod', method)

  return (
    <form
      className="rounded-4xl border border-border bg-surface p-6 shadow-surface sm:p-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <h2 className="font-serif text-3xl">Контакт и получение</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Имя
          <input
            aria-describedby={errors.name ? 'checkout-name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className={fieldClassName}
            id="checkout-name"
            name="name"
            type="text"
            value={form.name}
            onChange={(event) => onChange('name', event.currentTarget.value)}
          />
          {errors.name && (
            <span
              className="mt-2 block text-xs text-danger"
              id="checkout-name-error"
            >
              {errors.name}
            </span>
          )}
        </label>
        <label className="text-sm font-semibold">
          Телефон
          <input
            aria-describedby={errors.phone ? 'checkout-phone-error' : undefined}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            className={fieldClassName}
            id="checkout-phone"
            inputMode="tel"
            name="phone"
            placeholder="+996 555 123 456"
            type="tel"
            value={form.phone}
            onChange={(event) => onChange('phone', event.currentTarget.value)}
          />
          {errors.phone && (
            <span
              className="mt-2 block text-xs text-danger"
              id="checkout-phone-error"
            >
              {errors.phone}
            </span>
          )}
        </label>
      </div>

      <fieldset className="mt-7">
        <legend className="text-sm font-semibold">
          Как получить в Бишкеке
        </legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {deliveryOptions.map(([method, label, description]) => (
            <label
              className="flex min-h-20 cursor-pointer gap-3 rounded-2xl border border-control-border p-4 has-checked:border-ink-950 has-checked:bg-paper-100"
              key={method}
            >
              <input
                checked={form.deliveryMethod === method}
                className="mt-1 size-5 accent-ink-950"
                id={`checkout-delivery-${method}`}
                name="delivery"
                type="radio"
                value={method}
                onChange={() => setDeliveryMethod(method)}
              />
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-ink-500">
                  {description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {form.deliveryMethod === 'courier' && (
        <label className="mt-5 block text-sm font-semibold">
          Адрес в Бишкеке
          <input
            aria-describedby={
              errors.address ? 'checkout-address-error' : undefined
            }
            aria-invalid={Boolean(errors.address)}
            autoComplete="street-address"
            className={fieldClassName}
            id="checkout-address"
            name="address"
            type="text"
            value={form.address}
            onChange={(event) => onChange('address', event.currentTarget.value)}
          />
          {errors.address && (
            <span
              className="mt-2 block text-xs text-danger"
              id="checkout-address-error"
            >
              {errors.address}
            </span>
          )}
        </label>
      )}

      <label className="mt-5 block text-sm font-semibold">
        Комментарий{' '}
        <span className="font-normal text-ink-500">(необязательно)</span>
        <textarea
          className={`${fieldClassName} min-h-28 resize-y py-3`}
          id="checkout-comment"
          maxLength={500}
          name="comment"
          value={form.comment}
          onChange={(event) => onChange('comment', event.currentTarget.value)}
        />
      </label>

      <div className="mt-7 space-y-2 border-t border-border pt-6">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl p-2 text-sm leading-6 hover:bg-paper-100">
          <input
            checked={form.approvedLayoutConfirmed}
            className="mt-0.5 size-5 shrink-0 accent-ink-950"
            name="approvedLayoutConfirmed"
            type="checkbox"
            onChange={(event) =>
              onChange('approvedLayoutConfirmed', event.currentTarget.checked)
            }
          />
          Использовать в заявке именно утверждённую версию макета.
        </label>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl p-2 text-sm leading-6 hover:bg-paper-100">
          <input
            checked={form.mockConditionsAcknowledged}
            className="mt-0.5 size-5 shrink-0 accent-ink-950"
            name="mockConditionsAcknowledged"
            type="checkbox"
            onChange={(event) =>
              onChange(
                'mockConditionsAcknowledged',
                event.currentTarget.checked,
              )
            }
          />
          Понимаю, что это beta-заявка: менеджер подтвердит цену, срок и способ
          оплаты перед запуском печати.
        </label>
      </div>

      {!isOnline && (
        <p className="mt-5 text-sm text-warning" role="status">
          Нет подключения. Данные останутся на экране до восстановления сети.
        </p>
      )}
      {errorMessage && (
        <p className="mt-5 text-sm leading-6 text-danger" role="alert">
          {errorMessage}
        </p>
      )}
      <button
        className="mt-6 min-h-12 w-full rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!canSubmit}
        type="submit"
      >
        {isSubmitting ? 'Создаём заявку…' : 'Создать beta-заявку'}
      </button>
    </form>
  )
}
