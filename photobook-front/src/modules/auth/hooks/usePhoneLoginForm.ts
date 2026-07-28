import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { useCreateAuthChallengeMutation } from '@auth/api'
import {
  getAuthErrorMessage,
  getSafeReturnTo,
  normalizeKyrgyzPhone,
} from '@auth/libs'

export const usePhoneLoginForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createChallenge, challenge] = useCreateAuthChallengeMutation()
  const returnTo = getSafeReturnTo(searchParams.get('returnTo'))

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const contact = normalizeKyrgyzPhone(phone)
    if (!contact) {
      setError('Введите кыргызстанский номер из девяти цифр.')
      return
    }

    setError(null)
    try {
      const result = await createChallenge({
        channel: 'phone',
        contact,
        locale: 'ru',
      }).unwrap()
      const nextParams = new URLSearchParams({
        challengeId: result.challengeId,
        contact: result.maskedContact,
        returnTo,
      })
      void navigate(`/login/verify?${nextParams.toString()}`)
    } catch (requestError: unknown) {
      setError(getAuthErrorMessage(requestError))
    }
  }

  return {
    error,
    isSubmitting: challenge.isLoading,
    phone,
    setPhone,
    submit,
  }
}
