import { OtpVerificationForm } from '@auth-ui/OtpVerificationForm'
import { AuthPageLayout } from '@auth-ui/AuthPageLayout'

export function VerifyLoginScreen() {
  return (
    <AuthPageLayout
      description="Введите шесть цифр из последнего сообщения. Код действует ограниченное время."
      title="Подтвердите вход"
    >
      <OtpVerificationForm />
    </AuthPageLayout>
  )
}
