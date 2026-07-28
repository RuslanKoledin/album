import { useState } from 'react'

import { useGetAuthSessionQuery, useLogoutMutation } from '@auth/api'
import { getAuthErrorMessage } from '@auth/libs'

export const useAccountSession = () => {
  const session = useGetAuthSessionQuery()
  const [logout, logoutRequest] = useLogoutMutation()
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const signOut = async () => {
    if (!session.data?.authenticated) return

    setLogoutError(null)
    try {
      await logout({ csrfToken: session.data.csrfToken }).unwrap()
    } catch (error: unknown) {
      setLogoutError(getAuthErrorMessage(error))
    }
  }

  return {
    isSigningOut: logoutRequest.isLoading,
    logoutError,
    session,
    signOut,
  }
}
