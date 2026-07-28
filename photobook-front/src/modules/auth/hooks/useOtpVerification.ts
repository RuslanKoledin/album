import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import {
  useResendAuthChallengeMutation,
  useVerifyAuthChallengeMutation,
} from '@auth/api'
import { getAuthErrorMessage, getSafeReturnTo } from '@auth/libs'

export const useOtpVerification = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [verifyChallenge, verification] = useVerifyAuthChallengeMutation()
  const [resendChallenge, resend] = useResendAuthChallengeMutation()
  const challengeId = searchParams.get('challengeId')?.trim() ?? ''
  const maskedContact = searchParams.get('contact')?.trim() ?? ''
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'))
  const hasChallenge = challengeId.length > 0 && challengeId.length <= 128

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^[0-9]{6}$/.test(code)) {
      setError('Введите все шесть цифр из сообщения.')
      return
    }

    setError(null)
    try {
      await verifyChallenge({ challengeId, body: { code } }).unwrap()
      void navigate(returnTo, { replace: true })
    } catch (requestError: unknown) {
      setError(getAuthErrorMessage(requestError))
    }
  }

  const resendCode = async () => {
    setError(null)
    setNotice(null)
    try {
      const result = await resendChallenge(challengeId).unwrap()
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('challengeId', result.challengeId)
      nextParams.set('contact', result.maskedContact)
      setSearchParams(nextParams, { replace: true })
      setNotice('Новый код отправлен. Используйте последнее сообщение.')
    } catch (requestError: unknown) {
      setError(getAuthErrorMessage(requestError))
    }
  }

  return {
    code,
    error,
    hasChallenge,
    isResending: resend.isLoading,
    isSubmitting: verification.isLoading,
    maskedContact,
    notice,
    resendCode,
    setCode: (value: string) =>
      setCode(value.replaceAll(/\D/g, '').slice(0, 6)),
    submit,
  }
}
