import type { OrderDto } from '@modules/order'
import type { ProjectDto } from '@modules/project'
import type { ApprovalDto, PreflightRunDto } from '@modules/project-review'

export interface OperatorOrderDetailDto {
  readonly order: OrderDto
  readonly project: ProjectDto
  readonly approvedRevision: OperatorRevisionSummaryDto
  readonly approval: ApprovalDto
  readonly preflightRun: PreflightRunDto
}

export interface OperatorRevisionSummaryDto {
  readonly id: string
  readonly projectId: string
  readonly revisionNumber: number
  readonly documentHash: string
  readonly createdAt: string
}
