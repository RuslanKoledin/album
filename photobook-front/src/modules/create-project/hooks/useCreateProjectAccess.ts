import { useLocation, useNavigate } from 'react-router'

import { useGetAuthSessionQuery } from '@modules/auth'

import { getCreatePhotoReturnTo } from '@create-project/libs'

export function useCreateProjectAccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const sessionQuery = useGetAuthSessionQuery()
  const isChecking =
    sessionQuery.isLoading || (sessionQuery.isFetching && !sessionQuery.data)

  const signInForPhotos = () => {
    const returnTo = getCreatePhotoReturnTo(location.pathname, location.search)
    void navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`)
  }

  const continueToPhotos = (onAuthenticated: () => void) => {
    if (isChecking) return
    if (sessionQuery.isError) {
      void sessionQuery.refetch()
      return
    }
    if (sessionQuery.data?.authenticated) onAuthenticated()
    else signInForPhotos()
  }

  return {
    continueToPhotos,
    isAuthenticated: sessionQuery.data?.authenticated === true,
    isChecking,
    isError: sessionQuery.isError,
    retry: () => void sessionQuery.refetch(),
    session: sessionQuery.data ?? null,
    signInForPhotos,
  }
}
