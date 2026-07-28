import type { Approval, PreflightRun } from '@photobook/database'

import type {
  ApprovalChecklist,
  PreflightIssue,
  PreflightRunResponse,
} from './review.types.js'

export function mapPreflightRun(run: PreflightRun): PreflightRunResponse {
  return {
    completedAt: run.completedAt?.toISOString() ?? null,
    createdAt: run.createdAt.toISOString(),
    id: run.id,
    issues: run.issues as unknown as readonly PreflightIssue[],
    projectId: run.projectId,
    revisionId: run.revisionId,
    status: run.status.toLowerCase() as PreflightRunResponse['status'],
  }
}

export function mapApproval(approval: Approval) {
  return {
    acknowledgedWarningIds: approval.acknowledgedWarningIds,
    approvedAt: approval.approvedAt.toISOString(),
    approvedRevisionId: approval.approvedRevisionId,
    checklist: approval.checklist as unknown as ApprovalChecklist,
    id: approval.id,
    preflightRunId: approval.preflightRunId,
    projectId: approval.projectId,
  }
}
