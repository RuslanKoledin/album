export interface PreflightRunRequest {
  readonly revisionId: string
}

export interface PreflightIssue {
  readonly code: string
  readonly details: {
    readonly actualDpi?: number
    readonly requiredDpi?: number
  }
  readonly elementId: string | null
  readonly id: string
  readonly messageKey: string
  readonly severity: 'blocking' | 'info' | 'warning'
  readonly surfaceId: string | null
}

export interface ApprovalChecklist {
  readonly captionsChecked: boolean
  readonly cropUnderstood: boolean
  readonly datesChecked: boolean
  readonly namesChecked: boolean
  readonly pageOrderChecked: boolean
  readonly readyForPrint: boolean
}

export interface CreateApprovalRequest {
  readonly acknowledgedWarningIds: readonly string[]
  readonly checklist: ApprovalChecklist
  readonly preflightRunId: string
  readonly revisionId: string
}

export interface PreflightRunResponse {
  readonly completedAt: string | null
  readonly createdAt: string
  readonly id: string
  readonly issues: readonly PreflightIssue[]
  readonly projectId: string
  readonly revisionId: string
  readonly status: 'failed' | 'queued' | 'running' | 'succeeded'
}
