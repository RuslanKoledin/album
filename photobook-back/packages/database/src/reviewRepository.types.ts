import type {
  Approval,
  PreflightRun,
  Prisma,
} from './generated/prisma/client.js'

export interface CreatePreflightRunInput {
  readonly hasBlockingIssues: boolean
  readonly issues: Prisma.InputJsonValue
  readonly ownerId: string
  readonly projectId: string
  readonly revisionId: string
  readonly runId: string
}

export type CreatePreflightRunResult =
  | {
      readonly kind: 'created'
      readonly run: PreflightRun
    }
  | { readonly kind: 'not_found' }
  | {
      readonly kind: 'revision_conflict'
      readonly latestRevisionId: string
    }

export interface CreateApprovalInput {
  readonly acknowledgedWarningIds: readonly string[]
  readonly approvedByUserId: string
  readonly approvalId: string
  readonly approvedRevisionId: string
  readonly checklist: Prisma.InputJsonValue
  readonly preflightRunId: string
  readonly projectId: string
  readonly requestHash: string
}

export type CreateApprovalResult =
  | {
      readonly approval: Approval
      readonly kind: 'created' | 'replayed'
    }
  | { readonly kind: 'not_found' }
  | { readonly kind: 'request_conflict' }
  | {
      readonly kind: 'revision_conflict'
      readonly latestRevisionId: string
    }
