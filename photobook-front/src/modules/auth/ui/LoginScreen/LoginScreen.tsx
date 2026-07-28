import { Navigate, useSearchParams } from 'react-router'

import { useGetAuthSessionQuery } from '@auth/api'
import { getSafeReturnTo } from '@auth/libs'
import { AuthPageLayout } from '@auth-ui/AuthPageLayout'
import { PhoneLoginForm } from '@auth-ui/PhoneLoginForm'

export function LoginScreen() {
  const [searchParams] = useSearchParams()
  const session = useGetAuthSessionQuery()
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'))

  if (session.data?.authenticated) {
    return <Navigate replace to={returnTo} />
  }

  return (
    <AuthPageLayout
      description="Мы отправим одноразовый код. Пароль придумывать и запоминать не нужно."
      title="Введите номер телефона"
    >
      {session.isLoading ? (
        <p
          className="mt-8 rounded-2xl bg-paper-100 p-5 text-sm text-ink-700"
          role="status"
        >
          Проверяем текущую сессию…
        </p>
      ) : session.isError ? (
        <div className="mt-8 rounded-2xl bg-warning-soft p-5">
          <p className="text-sm leading-6 text-warning">
            Не удалось проверить сессию. Проверьте подключение и повторите.
          </p>
          <button
            className="mt-4 min-h-11 rounded-full bg-ink-950 px-5 text-sm font-semibold text-surface"
            type="button"
            onClick={() => void session.refetch()}
          >
            Повторить
          </button>
        </div>
      ) : (
        <PhoneLoginForm />
      )}
    </AuthPageLayout>
  )
}
