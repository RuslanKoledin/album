import { AccountSessionPanel } from '@modules/auth'

import type { ReturnTypeUseAccountScreen } from './types'
import { AccountTabs } from '@account-ui/AccountTabs'
import { OrderList } from '@account-ui/OrderList'
import { ProjectList } from '@account-ui/ProjectList'

interface AuthenticatedAccountProps {
  readonly account: ReturnTypeUseAccountScreen
}

export function AuthenticatedAccount({ account }: AuthenticatedAccountProps) {
  const projects = account.projects.data?.items ?? []
  const orders = account.orders.data?.items ?? []
  const projectTitles = new Map(
    projects.map((project) => [project.id, project.title]),
  )

  return (
    <>
      <AccountTabs
        activeTab={account.activeTab}
        orderCount={orders.length}
        projectCount={projects.length}
      />
      <div className="mt-6">
        {account.activeTab === 'projects' && (
          <ProjectList
            isError={account.projects.isError}
            isLoading={account.projects.isLoading}
            projects={projects}
            retry={() => void account.projects.refetch()}
          />
        )}
        {account.activeTab === 'orders' && (
          <OrderList
            isError={account.orders.isError}
            isLoading={account.orders.isLoading}
            orders={orders}
            projectTitles={projectTitles}
            retry={() => void account.orders.refetch()}
          />
        )}
        {account.activeTab === 'profile' && <AccountSessionPanel />}
      </div>
    </>
  )
}
