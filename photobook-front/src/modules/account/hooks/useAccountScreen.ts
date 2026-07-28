import { useSearchParams } from 'react-router'

import { useGetAuthSessionQuery } from '@modules/auth'
import { useGetOrdersQuery } from '@modules/order'
import { useGetProjectsQuery } from '@modules/project'

import { isAccountTab } from '@account/model'

export function useAccountScreen() {
  const [searchParams] = useSearchParams()
  const session = useGetAuthSessionQuery()
  const authenticated = session.data?.authenticated === true
  const projects = useGetProjectsQuery(undefined, { skip: !authenticated })
  const orders = useGetOrdersQuery(undefined, { skip: !authenticated })
  const requestedTab = searchParams.get('tab')

  return {
    activeTab: isAccountTab(requestedTab) ? requestedTab : 'projects',
    orders,
    projects,
    session,
  }
}
